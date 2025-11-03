

import type React from "react"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface SiberiaRecord {
  id: string
  codigo: string
  vuelo: string
  fecha_hora: string
  imagen_url: string
  firma: boolean
  usuario?: string
}

interface EditSiberiaModalProps {
  record: SiberiaRecord
  onClose: () => void
  onSave: (record: SiberiaRecord) => void
}

export function EditSiberiaModal({ record, onClose, onSave }: EditSiberiaModalProps) {
  const [formData, setFormData] = useState(record)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    onSave({
      ...formData,
      imagen_url: previewUrl || formData.imagen_url,
    })
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Registro Siberia</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Flight Number */}
          <div className="space-y-2">
            <Label htmlFor="flight">Número de Vuelo</Label>
            <Input
              id="flight"
              value={formData.vuelo}
              onChange={(e) => setFormData({ ...formData, vuelo: e.target.value })}
              placeholder="Ej: 2328"
              maxLength={10}
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-3">
            <Label>Foto de la Maleta</Label>
            <div className="space-y-3">
              {/* Current Photo */}
              <div className="relative h-40 w-full overflow-hidden rounded-lg border border-border bg-muted">
                <img src={previewUrl || formData.imagen_url} alt="Preview" className="h-full w-full object-cover" />
              </div>

              {/* File Input */}
              <div className="flex items-center gap-2">
                <Input type="file" accept="image/*" onChange={handleFileChange} className="flex-1" />
              </div>
              <p className="text-xs text-muted-foreground">Formatos soportados: JPG, PNG, WebP</p>
            </div>
          </div>

          {/* Signed */}
          <div className="flex items-center justify-between">
            <Label htmlFor="signed" className="font-normal cursor-pointer">
              ¿Tiene firma?
            </Label>
            <Switch
              id="signed"
              checked={formData.firma}
              onCheckedChange={(checked) => setFormData({ ...formData, firma: checked })}
            />
          </div>
        </div>

        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground">
            Guardar Cambios
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
