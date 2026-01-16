

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, LayoutDashboard, BaggageClaim, BarChart3, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Panel principal", icon: LayoutDashboard },
  { href: "/siberia", label: "Siberia", icon: BaggageClaim },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
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
          "fixed inset-y-0 left-0 z-40 border-r border-border bg-card transition-smooth md:relative md:translate-x-0",
          isCollapsed ? "w-20" : "w-56",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                RD
              </div>
              {!isCollapsed && <span className="font-semibold text-foreground">RegisBags</span>}
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn("h-8 w-8 transition-smooth", isCollapsed && "mx-auto")}
                title={isCollapsed ? "Expandir" : "Contraer"}
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
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
                      "w-full gap-3 transition-smooth",
                      isCollapsed ? "justify-center px-2" : "justify-start",
                      isActive && "bg-primary text-primary-foreground",
                    )}
                    onClick={() => setIsOpen(false)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border px-4 py-4">
            {!isCollapsed && <p className="text-xs text-muted-foreground">&copy; 2025 RegisBags</p>}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
