import { useState } from "react"
import { Mail, Loader, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface EmailReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSendEmail: (email: string) => Promise<void>
  reportPeriod: string
}

const PRESET_EMAILS = [
  { id: 1, email: "chemoranxv5@gmail.com", label: "Gerencia General" },
  { id: 2, email: "hapaza.221ds02@istta.edu.pe", label: "Operaciones" },
  { id: 3, email: "calidad@aeropuerto.com", label: "Control de Calidad" },
]

export function EmailReportDialog({
  open,
  onOpenChange,
  onSendEmail,
  reportPeriod,
}: EmailReportDialogProps) {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [customEmail, setCustomEmail] = useState("")
  const [isCustom, setIsCustom] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [emailError, setEmailError] = useState("")

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSelectPreset = (email: string) => {
    setSelectedEmail(email)
    setIsCustom(false)
    setEmailError("")
  }

  const handleCustomEmailChange = (value: string) => {
    setCustomEmail(value)
    setIsCustom(true)
    setSelectedEmail(null)
    if (value && !validateEmail(value)) {
      setEmailError("Ingresa un correo electrónico válido")
    } else {
      setEmailError("")
    }
  }

  const handleSend = async () => {
    const emailToSend = isCustom ? customEmail : selectedEmail

    if (!emailToSend) {
      setEmailError("Selecciona o ingresa un correo electrónico")
      return
    }

    if (!validateEmail(emailToSend)) {
      setEmailError("Ingresa un correo electrónico válido")
      return
    }

    setIsSending(true)
    try {
      await onSendEmail(emailToSend)
      // Reset form
      setSelectedEmail(null)
      setCustomEmail("")
      setIsCustom(false)
      setEmailError("")
      onOpenChange(false)
    } catch (error) {
      setEmailError("Error al enviar el correo. Intenta nuevamente.")
    } finally {
      setIsSending(false)
    }
  }

  const handleClose = () => {
    if (!isSending) {
      setSelectedEmail(null)
      setCustomEmail("")
      setIsCustom(false)
      setEmailError("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Enviar Reporte por Email
          </DialogTitle>
          <DialogDescription>
            Envía el reporte de <strong>{reportPeriod}</strong> a un destinatario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preset Emails */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Destinatarios habituales</Label>
            <div className="grid gap-2">
              {PRESET_EMAILS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.email)}
                  disabled={isSending}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-3 text-left transition-all hover:bg-accent",
                    selectedEmail === preset.email && !isCustom
                      ? "border-primary bg-primary/5"
                      : "border-border",
                    isSending && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{preset.label}</p>
                    <p className="text-xs text-muted-foreground">{preset.email}</p>
                  </div>
                  {selectedEmail === preset.email && !isCustom && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Email */}
          <div className="space-y-2">
            <Label htmlFor="custom-email" className="text-sm font-medium">
              Otro destinatario
            </Label>
            <div className="relative">
              <Input
                id="custom-email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={customEmail}
                onChange={(e) => handleCustomEmailChange(e.target.value)}
                disabled={isSending}
                className={cn(
                  "pr-10",
                  emailError && isCustom && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {isCustom && customEmail && !emailError && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
              {isCustom && emailError && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
              )}
            </div>
            {emailError && isCustom && (
              <p className="text-xs text-destructive">{emailError}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || (!selectedEmail && !customEmail) || (isCustom && !!emailError)}
            className="gap-2"
          >
            {isSending ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Enviar Reporte
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
