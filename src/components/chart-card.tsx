import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface ChartCardProps {
  title: string
  description?: string
  children: ReactNode
  height?: string
  className?: string
}

export function ChartCard({ title, description, children, height = "h-80", className }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className={height}>{children}</div>
      </CardContent>
    </Card>
  )
}
