import { TrendingUp, TrendingDown } from "lucide-react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
interface SignatureData {
  category: string
  count: number
  fill: string
}

interface ChartPieDonutProps {
  data: SignatureData[]
  total: number
}

const chartConfig = {
  count: {
    label: "Registros",
  },
  conFirma: {
    label: "Con Firma",
    color: "var(--chart-1)",
  },
  sinFirma: {
    label: "Sin Firma",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartPieDonut({ data, total }: ChartPieDonutProps) {
  const firmados = data.find(d => d.category === "Con Firma")?.count || 0
  const porcentajeFirmas = total > 0 ? Math.round((firmados / total) * 100) : 0
  const esBuenaTasa = porcentajeFirmas >= 80

  return (
    <Card className="flex flex-col gap-0 py-4">
      <CardHeader className="items-center justify-center text-center">
        <CardTitle>Comparativa de Firmas</CardTitle>
        <CardDescription>Registros firmados vs sin firmar</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-square w-30 h-30 mx-auto"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="count"
              nameKey="category"
              innerRadius={20}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Tasa de firmas: {porcentajeFirmas}%{" "}
          {esBuenaTasa ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          {esBuenaTasa
            ? "Excelente tasa de firmas"
            : "Se recomienda mejorar la tasa de firmas"}
        </div>
      </CardFooter>
    </Card>
  )
}
