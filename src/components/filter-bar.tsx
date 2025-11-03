

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface FilterBarProps {
  children: ReactNode
  onReset?: () => void
  showReset?: boolean
}

export function FilterBar({ children, onReset, showReset = true }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">{children}</div>
      {showReset && onReset && (
        <Button variant="outline" size="sm" onClick={onReset} className="gap-2 w-full sm:w-auto bg-transparent">
          <X className="h-4 w-4" />
          <span>Limpiar</span>
        </Button>
      )}
    </div>
  )
}
