

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface EditCounterModalProps {
  record: CounterRecord
  onClose: () => void
  onSave: (record: CounterRecord) => void
}

export function EditCounterModal({ record, onClose, onSave }: EditCounterModalProps) {
  const [formData, setFormData] = useState(record)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(record.categorias))

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = new Set(selectedCategories)
    if (checked) {
      newCategories.add(category)
    } else {
      newCategories.delete(category)
    }
    setSelectedCategories(newCategories)
  }

  const handleSave = () => {
    onSave({
      ...formData,
      categorias: Array.from(selectedCategories),
    })
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Registro</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Airline */}
          <div className="space-y-2">
            <Label htmlFor="airline">Aerolínea</Label>
            <Select
              value={formData.aerolinea}
              onValueChange={(value) => setFormData({ ...formData, aerolinea: value })}
            >
              <SelectTrigger id="airline">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LATAM">LATAM</SelectItem>
                <SelectItem value="Sky">Sky</SelectItem>
                <SelectItem value="JetSmart">JetSmart</SelectItem>
                <SelectItem value="avianca">avianca</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <Label>Categorías de Daño</Label>
            <div className="space-y-2">
              {["A", "B", "C"].map((cat) => (
                <div key={cat} className="flex items-center gap-2">
                  <Checkbox
                    id={`cat-${cat}`}
                    checked={selectedCategories.has(cat)}
                    onCheckedChange={(checked) => handleCategoryChange(cat, checked as boolean)}
                  />
                  <Label htmlFor={`cat-${cat}`} className="font-normal cursor-pointer">
                    Categoría {cat}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Observation */}
          <div className="space-y-2">
            <Label htmlFor="observation">Observación</Label>
            <Textarea
              id="observation"
              value={formData.observacion}
              onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
              placeholder="Describe el daño..."
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">{formData.observacion.length}/500 caracteres</p>
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
