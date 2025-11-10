

import { useState } from "react"
import useSWR from "swr"
import { Search, MoreVertical, Trash2, Edit2, Loader } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  const [editingRecord, setEditingRecord] = useState<SiberiaRecord | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<SiberiaRecord | null>(null)
  const [viewingImage, setViewingImage] = useState<SiberiaRecord | null>(null)

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
    (item: SiberiaRecord) =>
      item.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vuelo.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
        const { error } = await supabase.from("siberia").delete().eq("id", deletingRecord.id)

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
      const { error } = await supabase.from("siberia").update(updatedRecord).eq("id", updatedRecord.id)

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

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Búsqueda</CardTitle>
              <CardDescription>Buscar por código o número de vuelo</CardDescription>
            </div>
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
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
                  filteredData.map((record: SiberiaRecord) => (
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
