import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { CheckCircle, XCircle, Loader, Mail } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"

export function EmailConfirmation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Obtener los parámetros de la URL
        const token = searchParams.get("token")
        const type = searchParams.get("type")

        if (!token || type !== "signup") {
          setStatus("error")
          setMessage("Enlace de confirmación inválido o expirado.")
          return
        }

        // Verificar el token con Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "signup",
        })

        if (error) {
          setStatus("error")
          setMessage("Error al confirmar el correo. El enlace puede haber expirado.")
          console.error("Confirmation error:", error)
          return
        }

        setStatus("success")
        setMessage("¡Tu correo ha sido confirmado exitosamente!")

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      } catch (err) {
        setStatus("error")
        setMessage("Ocurrió un error inesperado. Por favor, intenta nuevamente.")
        console.error("Unexpected error:", err)
      }
    }

    confirmEmail()
  }, [searchParams, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Confirmation Card */}
      <Card className="relative w-full max-w-md border-border bg-card shadow-2xl">
        <div className="p-8">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
              RD
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">RegisBags</h1>
              <p className="text-sm text-muted-foreground">Confirmación de Correo</p>
            </div>
          </div>

          {/* Status Content */}
          <div className="space-y-6">
            {status === "loading" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="relative">
                  <Mail className="h-16 w-16 text-primary" />
                  <Loader className="absolute -bottom-2 -right-2 h-8 w-8 animate-spin text-primary" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Confirmando tu correo...
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Por favor espera un momento
                  </p>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping">
                    <CheckCircle className="h-16 w-16 text-green-500 opacity-75" />
                  </div>
                  <CheckCircle className="relative h-16 w-16 text-green-500" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    ¡Correo Confirmado!
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {message}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Loader className="h-3 w-3 animate-spin" />
                    <span>Redirigiendo al inicio de sesión...</span>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full mt-4"
                >
                  Ir al Inicio de Sesión
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <XCircle className="h-16 w-16 text-destructive" />
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Error de Confirmación
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {message}
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full"
                  >
                    Volver al Inicio de Sesión
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="w-full"
                  >
                    Intentar Nuevamente
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 border-t border-border pt-6">
            <p className="text-center text-xs text-muted-foreground">
              Sistema de administración de maletas dañadas
              <br />
              Talma Servicios Aeroportuarios
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
