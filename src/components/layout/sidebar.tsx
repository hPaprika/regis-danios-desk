

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, LayoutDashboard, BriefcaseConveyorBelt, BaggageClaim, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/counter", label: "Counter", icon: BriefcaseConveyorBelt },
  { href: "/siberia", label: "Siberia", icon: BaggageClaim },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const pathname = location.pathname

  return (
    <>
      {/* Mobile Toggle */}
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="transition-smooth">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card transition-smooth md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-border px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                RD
              </div>
              <span className="font-semibold text-foreground">RegisDaños</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 transition-smooth",
                      isActive && "bg-primary text-primary-foreground",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border px-4 py-4">
            <p className="text-xs text-muted-foreground">v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
