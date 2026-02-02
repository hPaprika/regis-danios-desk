import { Bar, BarChart, XAxis, YAxis } from "recharts"

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
interface FlightIncidentData {
  vuelo: string
  incidencias: number
}

interface ChartBarHorizontalProps {
  data: FlightIncidentData[]
}

const chartConfig = {
  incidencias: {
    label: "Incidencias",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartBarHorizontal({ data }: ChartBarHorizontalProps) {
  return (
    <Card className="py-4 gap-3">
      <CardHeader>
        <CardTitle>Vuelos con Más Incidencias</CardTitle>
        <CardDescription>Top vuelos con mayor cantidad de daños</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: 0,
            }}
            barCategoryGap="6%"
          >
            <XAxis type="number" dataKey="incidencias" hide />
            <YAxis
              dataKey="vuelo"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={50}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="incidencias" fill="var(--color-incidencias)" radius={5} barSize={35} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
