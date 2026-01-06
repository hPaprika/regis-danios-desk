

import { Moon, Sun, LogOut, Mail } from "lucide-react"
import { useTheme } from "next-themes"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Supabase v2: getUser
        const resp: any = await supabase.auth.getUser()
        if (resp?.data?.user?.email) {
          setUserEmail(resp.data.user.email)
          return
        }

        // Fallback for older clients
        const maybeUser: any = (supabase.auth as any).user?.()
        if (maybeUser?.email) setUserEmail(maybeUser.email)
      } catch (err) {
        // ignore
      }
    }
    loadUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Admin Panel - RegisBags</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="transition-smooth"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {userEmail?.charAt(0).toUpperCase() ?? 'U'}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Mail className="h-4 w-4 text-muted" />
                <span className="text-sm text-foreground">{userEmail ?? 'usuario@example.com'}</span>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
