

import { Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SiberiaRecord {
  id: string
  codigo: string
  vuelo: string
  fecha_hora: string
  imagen_url: string
  firma: boolean
  usuario?: string
}

interface ImageViewerDialogProps {
  record: SiberiaRecord
  onClose: () => void
}

export function ImageViewerDialog({ record, onClose }: ImageViewerDialogProps) {
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = record.imagen_url
    link.download = `maleta-${record.codigo}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Foto de Maleta - {record.codigo}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          <div className="relative w-full overflow-hidden rounded-lg border border-border bg-muted">
            <img
              src={record.imagen_url || "/placeholder.svg"}
              alt={`Maleta ${record.codigo}`}
              className="w-full h-auto"
            />
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Código</p>
              <p className="font-semibold text-foreground">{record.codigo}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Vuelo</p>
              <p className="font-semibold text-foreground">{record.vuelo}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fecha/Hora</p>
              <p className="font-semibold text-foreground">{new Date(record.fecha_hora).toLocaleString("es-CL")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Firma</p>
              <p className="font-semibold text-foreground">{record.firma ? "Sí" : "No"}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={handleDownload} className="gap-2 bg-primary text-primary-foreground">
            <Download className="h-4 w-4" />
            <span>Descargar</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
