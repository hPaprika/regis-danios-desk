import React from "react"
import { useMemo } from "react"
import useSWR from "swr"
import { Luggage, UserRoundCog, Signature, UserRoundSearch, Loader } from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { ChartCard } from "@/components/chart-card"
import { FilterBar } from "@/components/filter-bar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import supabase from "@/lib/supabase/client"

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

const unifiedFetcher = async () => {
  const { data, error } = await supabase.from("unified_records").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching unified_records:", error)
    throw new Error(error.message)
  }
  console.log("Unified data fetched:", data?.length || 0, "records")
  return data || []
}

export function DashboardPage() {
  const { data: unifiedData = [], isLoading, error } = useSWR("dashboard-unified", unifiedFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 10000,
  })

  const [filters, setFilters] = React.useState({
    dateFrom: "",
    dateTo: "",
    airline: "all",
    shift: "all",
  })

  const handleReset = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      airline: "all",
      shift: "all",
    })
  }

  const stats = useMemo(() => {
    const filteredData = unifiedData.filter((record: any) => {
      if (filters.airline !== "all" && record.aerolinea?.toLowerCase() !== filters.airline) return false
      if (filters.shift !== "all" && record.turno?.toLowerCase() !== filters.shift) return false
      return true
    })

    const totalSigned = filteredData.filter((r: any) => r.firma).length

    return {
      total: filteredData.length,
      counter: filteredData.filter((r: any) => r.source === "counter").length,
      siberia: filteredData.filter((r: any) => r.source === "siberia").length,
      signed: totalSigned,
      unsigned: filteredData.length - totalSigned,
    }
  }, [unifiedData, filters])

  const damagesByAirline = useMemo(() => {
    const airlines: Record<string, number> = {}
    unifiedData.forEach((record: any) => {
      if (record.aerolinea) {
        airlines[record.aerolinea] = (airlines[record.aerolinea] || 0) + 1
      }
    })
    return Object.entries(airlines).map(([name, value]) => ({ name, value }))
  }, [unifiedData])

  const damagesByType = useMemo(() => {
    const types: Record<string, number> = {}
    unifiedData.forEach((record: any) => {
      record.categorias?.forEach((cat: string) => {
        types[`Categoría ${cat}`] = (types[`Categoría ${cat}`] || 0) + 1
      })
    })
    return Object.entries(types).map(([name, value]) => ({ name, value }))
  }, [unifiedData])

  const temporalTrend = useMemo(() => {
    const trends: Record<string, any> = {}
    unifiedData.forEach((record: any) => {
      const date = new Date(record.fecha_hora).toLocaleDateString("es-PE", {
        month: "2-digit",
        day: "2-digit",
      })
      if (!trends[date]) trends[date] = { date, counter: 0, siberia: 0 }
      if (record.source === "counter") {
        trends[date].counter++
      } else if (record.source === "siberia") {
        trends[date].siberia++
      }
    })
    return Object.values(trends).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [unifiedData])

  const shiftComparison = useMemo(() => {
    const shifts: Record<string, any> = {
      Mañana: { shift: "BRC-ERC", counter: 0, siberia: 0 },
      Tarde: { shift: "IRC-KRC", counter: 0, siberia: 0 },
    }
    unifiedData.forEach((record: any) => {
      if (record.turno && shifts[record.turno]) {
        if (record.source === "counter") {
          shifts[record.turno].counter++
        } else if (record.source === "siberia") {
          shifts[record.turno].siberia++
        }
      }
    })
    return Object.values(shifts)
  }, [unifiedData])



  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Vista general del mes actual</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
          <p className="font-semibold">Error al cargar los datos</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Maletas"
          value={stats.total}
          icon={Luggage}
          description="Registros totales"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Counter"
          value={stats.counter}
          icon={UserRoundSearch}
          description="Registros en Counter"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Siberia"
          value={stats.siberia}
          icon={UserRoundCog}
          description="Registros en Siberia"
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Con Firma"
          value={`${stats.signed}/${stats.total}`}
          icon={Signature}
          description="Registros firmados"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Filters */}
      <FilterBar onReset={handleReset} showReset={true}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="date-from" className="text-xs">
            Desde
          </Label>
          <Input
            id="date-from"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="w-full sm:w-40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="date-to" className="text-xs">
            Hasta
          </Label>
          <Input
            id="date-to"
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="w-full sm:w-40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="airline" className="text-xs">
            Aerolínea
          </Label>
          <Select value={filters.airline} onValueChange={(value) => setFilters({ ...filters, airline: value })}>
            <SelectTrigger id="airline" className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="latam">LATAM</SelectItem>
              <SelectItem value="Sky">Sky</SelectItem>
              <SelectItem value="JetSmart">JetSmart</SelectItem>
              <SelectItem value="avianca">Avianca</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="shift" className="text-xs">
            Turno
          </Label>
          <Select value={filters.shift} onValueChange={(value) => setFilters({ ...filters, shift: value })}>
            <SelectTrigger id="shift" className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="mañana">BRC-ERC</SelectItem>
              <SelectItem value="tarde">IRC-KRC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterBar>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Damages by Airline */}
        <ChartCard title="Daños por Aerolínea" description="Distribución de maletas dañadas">
          {isLoading ? (
            <div className="flex items-center justify-center h-80">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : damagesByAirline.length === 0 ? (
            <div className="flex items-center justify-center h-80 text-muted-foreground">Sin datos disponibles</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={damagesByAirline}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "var(--foreground)" }}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Damages by Type */}
        <ChartCard title="Daños por Categoría" description="Categorización de daños">
          {isLoading ? (
            <div className="flex items-center justify-center h-80">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : damagesByType.length === 0 ? (
            <div className="flex items-center justify-center h-80 text-muted-foreground">Sin datos disponibles</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={damagesByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {damagesByType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    // backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "var(--foreground)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Temporal Trend */}
        <ChartCard title="Tendencia Temporal" description="Evolución de daños en el mes">
          {isLoading ? (
            <div className="flex items-center justify-center h-80">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : temporalTrend.length === 0 ? (
            <div className="flex items-center justify-center h-80 text-muted-foreground">Sin datos disponibles</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={temporalTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
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
                  dataKey="counter"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: "#2563eb" }}
                  name="Counter"
                />
                <Line
                  type="monotone"
                  dataKey="siberia"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981" }}
                  name="Siberia"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Shift Comparison */}
        <ChartCard title="Comparativa por Turno" description="Daños registrados por turno">
          {isLoading ? (
            <div className="flex items-center justify-center h-80">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : shiftComparison.length === 0 ? (
            <div className="flex items-center justify-center h-80 text-muted-foreground">Sin datos disponibles</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="shift" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "var(--foreground)" }}
                />
                <Legend />
                <Bar dataKey="counter" fill="#2563eb" radius={[8, 8, 0, 0]} name="Counter" />
                <Bar dataKey="siberia" fill="#10b981" radius={[8, 8, 0, 0]} name="Siberia" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
