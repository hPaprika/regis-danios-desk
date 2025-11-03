import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
  className?: string
}

export function StatsCard({ title, value, icon: Icon, trend, description, className }: StatsCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold text-foreground">{value}</div>
          {trend && (
            <div className="flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className={`text-xs font-medium ${trend.isPositive ? "text-success" : "text-destructive"}`}>
                {trend.value}%
              </span>
            </div>
          )}
        </div>
        {description && <p className="mt-2 text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )
}
