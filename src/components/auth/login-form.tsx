import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"

export function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setIsLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message === "Invalid login credentials"
          ? "Credenciales inválidas. Por favor verifica tu correo y contraseña."
          : authError.message)
        setIsLoading(false)
        return
      }

      if (data.session) {
        navigate("/")
      }
    } catch (err) {
      setError("Error al iniciar sesión. Por favor intenta nuevamente.")
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    // Validaciones
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setIsLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })

      if (authError) {
        setError(authError.message === "User already registered"
          ? "Este correo ya está registrado. Intenta iniciar sesión."
          : authError.message)
        setIsLoading(false)
        return
      }

      if (data.user) {
        setSuccessMessage("¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.")
        // Limpiar formulario
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        // Cambiar a modo login después de 3 segundos
        setTimeout(() => {
          setIsRegistering(false)
          setSuccessMessage("")
        }, 3000)
      }
    } catch (err) {
      setError("Error al registrar usuario. Por favor intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsRegistering(!isRegistering)
    setError("")
    setSuccessMessage("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background to-muted p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Login/Register Card */}
      <Card className="relative w-full max-w-md border-border bg-card shadow-2xl">
        <div className="p-8">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
              RD
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">RegisBags</h1>
              <p className="text-sm text-muted-foreground">
                {isRegistering ? "Crear Cuenta" : "Admin Panel"}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Correo Electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isRegistering && (
                <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
              )}
            </div>

            {/* Confirm Password (only for registration) */}
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 font-medium transition-smooth"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  <span>{isRegistering ? "Registrando..." : "Iniciando sesión..."}</span>
                </div>
              ) : (
                <>
                  {isRegistering ? (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Registrarse
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </>
              )}
            </Button>

            {/* Toggle Mode Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {isRegistering ? (
                  <>¿Ya tienes cuenta? <span className="font-semibold text-primary">Inicia sesión</span></>
                ) : (
                  <>¿No tienes cuenta? <span className="font-semibold text-primary">Regístrate</span></>
                )}
              </button>
            </div>
          </form>

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
