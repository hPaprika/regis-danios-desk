import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

// Interfaz para los datos del gráfico
interface ShiftComparisonData {
  periodo: string
  "BRC-ERC": number
  "IRC-KRC": number
}

interface ChartBarMultipleProps {
  data: ShiftComparisonData[]
  viewMode: "today" | "month" | "last7days"
}

const chartConfig = {
  "BRC-ERC": {
    label: "BRC-ERC",
    color: "var(--chart-1)",
  },
  "IRC-KRC": {
    label: "IRC-KRC",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartBarMultiple({ data, viewMode }: ChartBarMultipleProps) {
  // Determinar el título según el modo de vista
  const getTitle = () => {
    switch (viewMode) {
      case "today":
        return "Comparativa de Turnos - Hoy"
      case "last7days":
        return "Comparativa de Turnos - Últimos 7 Días"
      case "month":
        return "Comparativa de Turnos - Mes"
      default:
        return "Comparativa de Turnos"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>Registros por turno operativo</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="periodo"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 10)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="BRC-ERC" fill="var(--color-BRC-ERC)" radius={4} />
            <Bar dataKey="IRC-KRC" fill="var(--color-IRC-KRC)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
