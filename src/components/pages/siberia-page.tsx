

import { useState } from "react"
import useSWR from "swr"
import { Search, Loader, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Circle, CircleCheckBig } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageViewerDialog } from "@/components/modals/image-viewer-dialog"
import { supabase } from "@/lib/supabase/client"

interface SiberiaRecord {
  id: string
  codigo: string
  vuelo: string
  fecha_hora: string
  imagen_url: string
  firma: boolean
  turno: string
  usuario?: string
}

const fetcher = async () => {
  const { data, error } = await supabase.from("siberia").select("*").order("fecha_hora", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

// Helper: format short date and time with two-digit year and HH:MM
const formatShortDateTime = (iso?: string) => {
  if (!iso) return { datePart: "", timePart: "" }
  const d = new Date(iso)
  const day = d.getDate()
  const month = d.getMonth() + 1
  const year = String(d.getFullYear()).slice(-2)
  const datePart = `${day}/${month}/${year}`
  const timePart = d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })
  return { datePart, timePart }
}

export function SiberiaPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [signatureFilter, setSignatureFilter] = useState<string>("all")
  const [shiftFilter, setShiftFilter] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewingImage, setViewingImage] = useState<SiberiaRecord | null>(null)
  const recordsPerPage = 15

  const {
    data: siberiaData = [],
    isLoading,
    error,
  } = useSWR("siberia-page", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 5000,
  })

  const filteredData = siberiaData.filter(
    (item: SiberiaRecord) => {
      const matchesSearch =
        item.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vuelo.toLowerCase().includes(searchQuery.toLowerCase())

      // Filtrar por fecha: priorizar dateFilter manual, sino usar selectedDate
      const recordDate = new Date(item.fecha_hora)
      // Normalizar la fecha del registro a medianoche en zona horaria local
      const recordDateOnly = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate())

      let targetDate: Date
      if (dateFilter) {
        // Si hay un filtro manual de fecha, usarlo
        const [year, month, day] = dateFilter.split('-').map(Number)
        targetDate = new Date(year, month - 1, day)
      } else {
        // Sino, usar selectedDate normalizado
        targetDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
      }

      const matchesDate = recordDateOnly.getTime() === targetDate.getTime()

      // Filtro de firma
      const matchesFirma =
        signatureFilter === "all" ? true :
          signatureFilter === "con-firma" ? item.firma === true :
            signatureFilter === "sin-firma" ? item.firma === false :
              true

      // Filtro de turno
      const matchesTurno = shiftFilter === "all" ? true : item.turno === shiftFilter

      return matchesSearch && matchesDate && matchesFirma && matchesTurno
    }
  )

  // Determinar si estamos viendo el día actual
  const isToday = selectedDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]

  // Usar todos los datos filtrados (sin paginación, usaremos scroll interno)
  const displayData = filteredData

  // Reset cuando cambian los filtros
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const handleDateChange = (value: string) => {
    setDateFilter(value)
    // Si se establece un filtro manual, sincronizar selectedDate
    if (value) {
      const [year, month, day] = value.split('-').map(Number)
      setSelectedDate(new Date(year, month - 1, day))
    }
  }

  // Navegar al día anterior
  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate)
    previousDay.setDate(previousDay.getDate() - 1)
    setSelectedDate(previousDay)
    // Limpiar el filtro manual para que use selectedDate
    setDateFilter("")
  }

  // Navegar al día siguiente
  const goToNextDay = () => {
    const nextDay = new Date(selectedDate)
    nextDay.setDate(nextDay.getDate() + 1)
    setSelectedDate(nextDay)
    // Limpiar el filtro manual para que use selectedDate
    setDateFilter("")
  }

  // Volver al día actual
  const goToToday = () => {
    setSelectedDate(new Date())
    // Limpiar el filtro manual para que use selectedDate
    setDateFilter("")
  }

  const handleViewImage = (record: SiberiaRecord) => {
    setViewingImage(record)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Registros Siberia</h1>
        <p className="text-muted-foreground">Gestión de maletas dañadas en Siberia</p>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <div>
              <CardTitle>Búsqueda y Filtros</CardTitle>
              <CardDescription>Buscar por código o número de vuelo, y filtrar por fecha, firma y turno</CardDescription>
            </div>
            <div className="flex items-end flex-col sm:flex-row gap-4">
              <div className="relative flex-1 ">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              <div className="flex gap-2 items-end flex-wrap">
                <div className="flex-1 sm:flex-initial">
                  <Label htmlFor="date-filter" className="text-xs mb-1 block">
                    Filtrar por fecha
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="date-filter"
                      type="date"
                      value={dateFilter}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="pl-9 w-full sm:w-48"
                    />
                  </div>
                </div>
                <div className="flex-1 sm:flex-initial">
                  <Label htmlFor="firma-filter" className="text-xs mb-1 block">
                    Filtrar por firma
                  </Label>
                  <Select value={signatureFilter} onValueChange={(value) => {
                    setSignatureFilter(value)
                    // setCurrentPage(1)
                  }}>
                    <SelectTrigger id="firma-filter" className="w-full sm:w-40">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="con-firma">Con firma</SelectItem>
                      <SelectItem value="sin-firma">Sin firma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 sm:flex-initial">
                  <Label htmlFor="turno-filter" className="text-xs mb-1 block">
                    Filtrar por turno
                  </Label>
                  <Select value={shiftFilter} onValueChange={(value) => {
                    setShiftFilter(value)
                    // setCurrentPage(1)
                  }}>
                    <SelectTrigger id="turno-filter" className="w-full sm:w-40">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="BRC-ERC">BRC-ERC</SelectItem>
                      <SelectItem value="IRC-KRC">IRC-KRC</SelectItem>
                      <SelectItem value="ZRC-ARC">ZRC-ARC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(dateFilter || signatureFilter !== "all" || shiftFilter !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDateChange("")
                      setSignatureFilter("all")
                      setShiftFilter("all")
                    }}
                    size="sm"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {/* Scroll interno cuando hay más de recordsPerPage registros */}
          <div className="overflow-x-auto">
            <div className={filteredData.length > recordsPerPage ? "max-h-[800px] overflow-y-auto" : ""}>
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-border bg-card">
                    <th className="px-6 py-3 text-left font-semibold text-foreground">Código</th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">Vuelo</th>
                    <th className="px-6 py-3 text-center font-semibold text-foreground">Firma</th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">Foto</th>
                    <th className="px-6 py-3 text-center font-semibold text-foreground">Turno</th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">Fecha/Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <Loader className="h-4 w-4 animate-spin" />
                          Cargando registros...
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-destructive">
                        Error al cargar registros
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No se encontraron registros para esta fecha
                      </td>
                    </tr>
                  ) : (
                    displayData.map((record: SiberiaRecord) => {
                      const { datePart, timePart } = formatShortDateTime(record.fecha_hora)
                      // El turno viene de la base de datos
                      const turno = record.turno

                      return (
                        <tr key={record.id} className="border-b border-border transition-colors hover:bg-muted/50">
                          <td className="px-6 py-4 font-mono font-semibold text-foreground">{record.codigo}</td>
                          <td className="px-6 py-4 text-foreground">{record.vuelo}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center">
                              {record.firma ? (
                                <CircleCheckBig className="h-5 w-5 text-green-600" aria-hidden="true" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleViewImage(record)}
                              className="relative h-20 w-20 overflow-hidden rounded-lg border border-border transition-transform hover:scale-105 cursor-pointer"
                            >
                              <img
                                src={record.imagen_url || "/placeholder.svg"}
                                alt={`Foto de maleta ${record.codigo}`}
                                className="h-full w-full object-cover"
                              />
                            </button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${turno === "BRC-ERC"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : turno === "IRC-KRC"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  : turno === "ZRC-ARC"
                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                              }`}>
                              {turno}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            <div className="text-sm leading-snug">
                              <div>{datePart}</div>
                              <div>{timePart}</div>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Navegación por fecha */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {filteredData.length} {filteredData.length === 1 ? 'registro' : 'registros'} - {selectedDate.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousDay}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Día anterior
              </Button>
              {!isToday && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                >
                  Hoy
                </Button>
              )}
              {!isToday && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextDay}
                >
                  Día siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {viewingImage && <ImageViewerDialog record={viewingImage} onClose={() => setViewingImage(null)} />}
    </div>
  )
}
