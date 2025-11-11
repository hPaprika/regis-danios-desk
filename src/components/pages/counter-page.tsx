

import { useState } from "react"
import useSWR from "swr"
import { Search, MoreVertical, Trash2, Edit2, Loader, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditCounterModal } from "@/components/modals/edit-counter-modal"
import { DeleteConfirmDialog } from "@/components/modals/delete-confirm-dialog"
import supabase from "@/lib/supabase/client"

interface CounterRecord {
  id: string
  codigo: string
  aerolinea: string
  categorias: string[]
  observacion: string
  fecha_hora: string
  usuario: string
  turno: string
  firma: boolean
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  A: { bg: "bg-destructive", text: "text-destructive-foreground" },
  B: { bg: "bg-warning", text: "text-white" },
  C: { bg: "bg-primary", text: "text-primary-foreground" },
}

const fetcher = async () => {
  const { data, error } = await supabase.from("counter").select("*").order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export function CounterPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [editingRecord, setEditingRecord] = useState<CounterRecord | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<CounterRecord | null>(null)
  const recordsPerPage = 10

  const {
    data: counterData = [],
    isLoading,
    error,
    mutate,
  } = useSWR("counter-page", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 5000,
  })

  const filteredData = counterData.filter(
    (item: CounterRecord) => {
      const matchesSearch =
        item.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.aerolinea.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.observacion?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDate = dateFilter
        ? new Date(item.fecha_hora).toISOString().split('T')[0] === dateFilter
        : true

      return matchesSearch && matchesDate
    }
  )

  // Paginación
  const totalPages = Math.ceil(filteredData.length / recordsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  )

  // Reset a página 1 cuando cambian los filtros
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleDateChange = (value: string) => {
    setDateFilter(value)
    setCurrentPage(1)
  }

  const handleEdit = (record: CounterRecord) => {
    setEditingRecord(record)
  }

  const handleDelete = (record: CounterRecord) => {
    setDeletingRecord(record)
  }

  const confirmDelete = async () => {
    if (deletingRecord) {
      try {
        const { error } = await supabase
          .rpc('delete_unified_record', {
            p_id: deletingRecord.id,
            p_source: 'counter'
          })

        if (error) throw error
        mutate()
        setDeletingRecord(null)
      } catch (error) {
        console.error("Error deleting record:", error)
      }
    }
  }

  const handleSaveEdit = async (updatedRecord: CounterRecord) => {
    try {
      const { error } = await supabase
        .rpc('update_unified_record', {
          p_id: updatedRecord.id,
          p_source: 'counter',
          p_codigo: updatedRecord.codigo,
          p_aerolinea: updatedRecord.aerolinea,
          p_categorias: updatedRecord.categorias,
          p_observacion: updatedRecord.observacion,
          p_fecha_hora: updatedRecord.fecha_hora,
          p_usuario: updatedRecord.usuario,
          p_turno: updatedRecord.turno,
          p_firma: updatedRecord.firma
        })

      if (error) throw error
      mutate()
      setEditingRecord(null)
    } catch (error) {
      console.error("Error updating record:", error)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Registros Counter</h1>
        <p className="text-muted-foreground">Gestión de maletas dañadas en Counter</p>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <div>
              <CardTitle>Búsqueda y Filtros</CardTitle>
              <CardDescription>Buscar por código, aerolínea u observación, y filtrar por fecha</CardDescription>
            </div>
            <div className="flex items-end flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              <div className="flex gap-2 items-end">
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
                {dateFilter && (
                  <Button
                    variant="outline"
                    onClick={() => handleDateChange("")}
                    size="sm"
                  >
                    Limpiar
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Código</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Aerolínea</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Categorías</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Observación</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Fecha/Hora</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Usuario</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Turno</th>
                  <th className="px-6 py-3 text-center font-semibold text-foreground">Firma</th>
                  <th className="px-6 py-3 text-center font-semibold text-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        Cargando registros...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-destructive">
                      Error al cargar registros
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                      No se encontraron registros
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((record: CounterRecord) => (
                    <tr key={record.id} className="border-b border-border transition-colors hover:bg-muted/50">
                      <td className="px-6 py-4 font-mono font-semibold text-foreground">{record.codigo}</td>
                      <td className="px-6 py-4 text-foreground">{record.aerolinea}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {record.categorias?.map((cat) => (
                            <Badge key={cat} className={`${categoryColors[cat]?.bg} ${categoryColors[cat]?.text}`}>
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-muted-foreground">{record.observacion}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(record.fecha_hora).toLocaleString("es-CL")}
                      </td>
                      <td className="px-6 py-4 text-foreground">{record.usuario}</td>
                      <td className="px-6 py-4 text-muted-foreground">{record.turno}</td>
                      <td className="px-6 py-4 text-center">
                        {record.firma ? (
                          <Badge className="bg-success text-white">✓</Badge>
                        ) : (
                          <Badge variant="outline">✗</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(record)} className="gap-2 cursor-pointer">
                              <Edit2 className="h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(record)}
                              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {filteredData.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * recordsPerPage) + 1} - {Math.min(currentPage * recordsPerPage, filteredData.length)} de {filteredData.length} registros
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <div className="flex items-center px-3 text-sm">
                  Página {currentPage} de {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {editingRecord && (
        <EditCounterModal record={editingRecord} onClose={() => setEditingRecord(null)} onSave={handleSaveEdit} />
      )}

      {deletingRecord && (
        <DeleteConfirmDialog
          title="Eliminar registro"
          description={`¿Estás seguro de que deseas eliminar el registro ${deletingRecord.codigo}? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingRecord(null)}
        />
      )}
    </div>
  )
}
