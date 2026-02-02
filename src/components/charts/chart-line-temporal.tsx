import { useMemo } from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SiberiaRecord {
  id: string
  codigo: string
  vuelo: string | null
  observacion: string | null
  fecha_hora: string
  turno: string | null
  firma: boolean
  imagen_url: string | null
  created_at: string
  updated_at: string
}

interface ChartLineTemporalProps {
  data: SiberiaRecord[]
  viewMode: "today" | "month" | "last7days"
  selectedMonth?: string
}

export function ChartLineTemporal({ data, viewMode, selectedMonth }: ChartLineTemporalProps) {
  const chartData = useMemo(() => {
    const pad = (n: number) => n.toString().padStart(2, '0')
    if (viewMode === "today") {
      const hourlyData = Array.from({ length: 12 }, (_, i) => {
        const hour = i * 2
        return {
          hour,
          label: hour.toString().padStart(2, '0'),
          count: 0
        }
      })

      data.forEach(record => {
        const recordDate = new Date(record.fecha_hora)
        const recordDay = `${recordDate.getFullYear()}-${pad(recordDate.getMonth() + 1)}-${pad(recordDate.getDate())}`
        const today = new Date()
        const todayDay = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

        if (recordDay === todayDay) {
          const recordHour = recordDate.getHours()
          const bucketStart = Math.floor(recordHour / 2) * 2
          const hourData = hourlyData.find(h => h.hour === bucketStart)
          if (hourData) {
            hourData.count++
          }
        }
      })

      return hourlyData.map(({ label, count }) => ({ label, count }))
    } else if (viewMode === "last7days") {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        const localDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
        return {
          date: localDate,
          label: date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
          count: 0
        }
      })

      data.forEach(record => {
        const rd = new Date(record.fecha_hora)
        const recordDate = `${rd.getFullYear()}-${pad(rd.getMonth() + 1)}-${pad(rd.getDate())}`
        const dayData = last7Days.find(d => d.date === recordDate)
        if (dayData) {
          dayData.count++
        }
      })

      return last7Days.map(({ label, count }) => ({ label, count }))
    } else {
      // Para mes: mostrar por día del mes
      const [year, month] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number)
      const daysInMonth = new Date(year, month, 0).getDate()

      const monthlyData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1
        const date = new Date(year, month - 1, day)
        const localDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
        return {
          date: localDate,
          label: day.toString(),
          count: 0
        }
      })

      data.forEach(record => {
        const rd = new Date(record.fecha_hora)
        const recordDate = `${rd.getFullYear()}-${pad(rd.getMonth() + 1)}-${pad(rd.getDate())}`
        const dayData = monthlyData.find(d => d.date === recordDate)
        if (dayData) {
          dayData.count++
        }
      })

      return monthlyData.map(({ label, count }) => ({ label, count }))
    }
  }, [data, viewMode, selectedMonth])

  // Calcular ticks del eje Y con mínimo de 10
  const yTicks = useMemo(() => {
    const maxValue = Math.max(...chartData.map(d => d.count), 0)
    const maxTick = Math.max(10, maxValue)

    // Generar ticks desde 0 hasta maxTick
    return Array.from({ length: maxTick + 1 }, (_, i) => i)
  }, [chartData])

  // Determinar el título según el modo de vista
  const getTitle = () => {
    switch (viewMode) {
      case "today":
        return "Tendencia del Día"
      case "last7days":
        return "Tendencia Últimos 7 Días"
      case "month":
        return "Tendencia del Mes"
      default:
        return "Tendencia Temporal"
    }
  }

  const getDescription = () => {
    switch (viewMode) {
      case "today":
        return "Distribución de daños por hora"
      case "last7days":
        return "Evolución de daños en la última semana"
      case "month":
        return "Evolución de daños durante el mes"
      default:
        return "Evolución temporal de daños"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="label"
              stroke="var(--muted-foreground)"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => viewMode === "today" ? value : value.slice(0, 10)}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              ticks={yTicks}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
              name="Maletas"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
