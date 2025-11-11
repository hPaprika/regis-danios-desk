

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
import { EditSiberiaModal } from "@/components/modals/edit-siberia-modal"
import { DeleteConfirmDialog } from "@/components/modals/delete-confirm-dialog"
import { ImageViewerDialog } from "@/components/modals/image-viewer-dialog"
import { supabase } from "@/lib/supabase/client"

interface SiberiaRecord {
  id: string
  codigo: string
  vuelo: string
  fecha_hora: string
  imagen_url: string
  firma: boolean
  
  usuario?: string
}

const fetcher = async () => {
  const { data, error } = await supabase.from("siberia").select("*").order("fecha_hora", { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export function SiberiaPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [editingRecord, setEditingRecord] = useState<SiberiaRecord | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<SiberiaRecord | null>(null)
  const [viewingImage, setViewingImage] = useState<SiberiaRecord | null>(null)
  const recordsPerPage = 10

  const {
    data: siberiaData = [],
    isLoading,
    error,
    mutate,
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

  const handleEdit = (record: SiberiaRecord) => {
    setEditingRecord(record)
  }

  const handleDelete = (record: SiberiaRecord) => {
    setDeletingRecord(record)
  }

  const handleViewImage = (record: SiberiaRecord) => {
    setViewingImage(record)
  }

  const confirmDelete = async () => {
    if (deletingRecord) {
      try {
        const { error } = await supabase
          .rpc('delete_unified_record', {
            p_id: deletingRecord.id,
            p_source: 'siberia'
          })

        if (error) throw error
        mutate()
        setDeletingRecord(null)
      } catch (error) {
        console.error("Error deleting record:", error)
      }
    }
  }

  const handleSaveEdit = async (updatedRecord: SiberiaRecord) => {
    try {
      const { error } = await supabase
        .rpc('update_unified_record', {
          p_id: updatedRecord.id,
          p_source: 'siberia',
          p_codigo: updatedRecord.codigo,
          p_vuelo: updatedRecord.vuelo,
          p_fecha_hora: updatedRecord.fecha_hora,
          p_imagen_url: updatedRecord.imagen_url,
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
        <h1 className="text-3xl font-bold text-foreground">Registros Siberia</h1>
        <p className="text-muted-foreground">Gestión de maletas dañadas en Siberia</p>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <div>
              <CardTitle>Búsqueda y Filtros</CardTitle>
              <CardDescription>Buscar por código o número de vuelo, y filtrar por fecha</CardDescription>
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
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Vuelo</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Fecha/Hora</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Foto</th>
                  <th className="px-6 py-3 text-center font-semibold text-foreground">Firma</th>
                  <th className="px-6 py-3 text-center font-semibold text-foreground">Acciones</th>
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
                      No se encontraron registros
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((record: SiberiaRecord) => (
                    <tr key={record.id} className="border-b border-border transition-colors hover:bg-muted/50">
                      <td className="px-6 py-4 font-mono font-semibold text-foreground">{record.codigo}</td>
                      <td className="px-6 py-4 text-foreground">{record.vuelo}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(record.fecha_hora).toLocaleString("es-CL")}
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
                            <DropdownMenuItem onClick={() => handleViewImage(record)} className="gap-2 cursor-pointer">
                              <Search className="h-4 w-4" />
                              <span>Ver Foto</span>
                            </DropdownMenuItem>
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
        <EditSiberiaModal record={editingRecord} onClose={() => setEditingRecord(null)} onSave={handleSaveEdit} />
      )}

      {deletingRecord && (
        <DeleteConfirmDialog
          title="Eliminar registro"
          description={`¿Estás seguro de que deseas eliminar el registro ${deletingRecord.codigo}? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingRecord(null)}
        />
      )}

      {viewingImage && <ImageViewerDialog record={viewingImage} onClose={() => setViewingImage(null)} />}
    </div>
  )
}
