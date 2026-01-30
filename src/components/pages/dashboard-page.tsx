import { useState, useMemo } from "react"
import useSWR from "swr"
import {
  Luggage, Signature, Clock,
  FileX, AlertCircle
} from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { FilterBar } from "@/components/filter-bar"
import { ChartPieDonut } from "@/components/charts/chart-pie-donut"
import { ChartBarMultiple } from "@/components/charts/chart-bar-multiple"
import { ChartBarHorizontal } from "@/components/charts/chart-bar-horizontal"
import { ChartLineTemporal } from "@/components/charts/chart-line-temporal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent }
  from "@/components/ui/card"
import { Alert, AlertDescription }
  from "@/components/ui/alert"
import supabase from "@/lib/supabase/client"

// types & interfaces
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

interface DashboardFilters {
  dateFrom: string
  dateTo: string
}

// helper functions
const getTodayRange = () => {
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0))
  const endOfDay = new Date(today.setHours(23, 59, 59, 999))
  return {
    start: startOfDay.toISOString(),
    end: endOfDay.toISOString()
  }
}

const getLast7DaysRange = () => {
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)
  today.setHours(23, 59, 59, 999)
  return {
    start: sevenDaysAgo.toISOString(),
    end: today.toISOString()
  }
}

const getMonthRange = (month: string) => {
  // month expected as "YYYY-MM"
  const [y, m] = month.split('-').map(Number)
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0)
  const end = new Date(y, m, 0, 23, 59, 59, 999)
  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}

// data fetcher
const createUnifiedFetcher = (mode: 'today' | 'month' | 'last7days', monthValue?: string) => async () => {
  let dateRange

  if (mode === 'today') {
    dateRange = getTodayRange()
  } else if (mode === 'last7days') {
    dateRange = getLast7DaysRange()
  } else {
    dateRange = getMonthRange(monthValue || new Date().toISOString().slice(0, 7))
  }

  try {
    const { data, error } = await supabase
      .from("siberia")
      .select("*")
      .gte('fecha_hora', dateRange.start)
      .lte('fecha_hora', dateRange.end)
      .order("fecha_hora", { ascending: false })

    if (error) {
      console.error("Error fetching siberia table:", error)
      throw new Error('Sin conexión a internet. Por favor, verifica tu conexión.')
    }

    console.log("Unified data fetched:", data?.length || 0, `records for ${mode}`)
    return data || []
  } catch (err) {
    // Detectar errores de conexión
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Sin conexión a internet. Por favor, verifica tu conexión.')
    }
    throw err
  }
}

// main component
export function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>({
    dateFrom: "",
    dateTo: "",
  })

  const [viewMode, setViewMode] = useState<'today' | 'month' | 'last7days'>('today')
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  )

  const { data: unifiedData = [], isLoading, error } = useSWR<SiberiaRecord[]>(
    `dashboard-unified-${viewMode}-${viewMode === 'month' ? selectedMonth : viewMode}`,
    createUnifiedFetcher(viewMode, selectedMonth),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
    }
  )

  // Apply date range filters
  const filteredByDate = useMemo(() => {
    return unifiedData.filter((record) => {
      if (filters.dateFrom) {
        const recordDate = new Date(record.fecha_hora)
        const fromDate = new Date(filters.dateFrom)
        if (recordDate < fromDate) return false
      }

      if (filters.dateTo) {
        const recordDate = new Date(record.fecha_hora)
        const toDate = new Date(filters.dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (recordDate > toDate) return false
      }

      return true
    })
  }, [unifiedData, filters])

  // KPIs Calculations
  const stats = useMemo(() => {
    const totalRecords = filteredByDate.length

    // Signature Rate
    const signedCount = filteredByDate.filter(r => r.firma).length
    const signatureRate = totalRecords > 0 ? Math.round((signedCount / totalRecords) * 100) : 0

    // Shifts
    const shiftCounts: Record<string, number> = { 'BRC-ERC': 0, 'IRC-KRC': 0 }
    filteredByDate.forEach(r => {
      if (r.turno && shiftCounts[r.turno] !== undefined) {
        shiftCounts[r.turno]++
      }
    })
    const dominantShift = shiftCounts['BRC-ERC'] >= shiftCounts['IRC-KRC'] ? 'BRC-ERC' : 'IRC-KRC'
    const dominantShiftCount = shiftCounts[dominantShift]
    const otherShift = dominantShift === 'BRC-ERC' ? 'IRC-KRC' : 'BRC-ERC'
    const otherShiftCount = shiftCounts[otherShift]

    return {
      total: totalRecords,
      signatureRate,
      signedCount,
      dominantShift,
      dominantShiftCount,
      otherShiftCount
    }
  }, [filteredByDate])



  // Chart Data: Signature Comparison (Pie Donut)
  const signatureData = useMemo(() => {
    const firmados = filteredByDate.filter(r => r.firma).length
    const sinFirma = filteredByDate.length - firmados
    return [
      { category: "Con Firma", count: firmados, fill: "var(--chart-1)" },
      { category: "Sin Firma", count: sinFirma, fill: "var(--chart-2)" }
    ]
  }, [filteredByDate])

  // Chart Data: Shift Comparison (Bar Multiple)
  const shiftComparisonData = useMemo(() => {
    if (viewMode === 'today') {
      // Para hoy, mostrar un solo punto con ambos turnos
      const brcCount = filteredByDate.filter(r => r.turno === 'BRC-ERC').length
      const ircCount = filteredByDate.filter(r => r.turno === 'IRC-KRC').length
      return [{
        periodo: 'Hoy',
        'BRC-ERC': brcCount,
        'IRC-KRC': ircCount
      }]
    } else if (viewMode === 'last7days') {
      // Para últimos 7 días, agrupar por día
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return {
          date: date.toISOString().split('T')[0],
          periodo: date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
          'BRC-ERC': 0,
          'IRC-KRC': 0
        }
      })

      filteredByDate.forEach(record => {
        const recordDate = new Date(record.fecha_hora).toISOString().split('T')[0]
        const dayData = last7Days.find(d => d.date === recordDate)
        if (dayData && record.turno) {
          if (record.turno === 'BRC-ERC') {
            dayData['BRC-ERC']++
          } else if (record.turno === 'IRC-KRC') {
            dayData['IRC-KRC']++
          }
        }
      })

      return last7Days.map(({ periodo, 'BRC-ERC': brc, 'IRC-KRC': irc }) => ({
        periodo,
        'BRC-ERC': brc,
        'IRC-KRC': irc
      }))
    } else {
      // Para mes, agrupar por semana
      const weeks: Record<string, { 'BRC-ERC': number, 'IRC-KRC': number }> = {}

      filteredByDate.forEach(record => {
        const date = new Date(record.fecha_hora)
        const weekNum = Math.ceil(date.getDate() / 7)
        const weekKey = `Semana ${weekNum}`

        if (!weeks[weekKey]) {
          weeks[weekKey] = { 'BRC-ERC': 0, 'IRC-KRC': 0 }
        }

        if (record.turno === 'BRC-ERC') {
          weeks[weekKey]['BRC-ERC']++
        } else if (record.turno === 'IRC-KRC') {
          weeks[weekKey]['IRC-KRC']++
        }
      })

      return Object.entries(weeks).map(([periodo, counts]) => ({
        periodo,
        ...counts
      }))
    }
  }, [filteredByDate, viewMode])

  // Chart Data: Top Flights (Bar Horizontal)
  const topFlightsData = useMemo(() => {
    const flightCounts: Record<string, number> = {}

    filteredByDate.forEach(r => {
      if (r.vuelo) {
        flightCounts[r.vuelo] = (flightCounts[r.vuelo] || 0) + 1
      }
    })

    return Object.entries(flightCounts)
      .map(([vuelo, incidencias]) => ({ vuelo, incidencias }))
      .sort((a, b) => b.incidencias - a.incidencias)
      .slice(0, 4) // Top 4 vuelos
  }, [filteredByDate])

  const handleReset = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
    })
  }

  return (
    <>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Indicadores Clave</h1>
            <p className="text-muted-foreground">
              {viewMode === 'today'
                ? new Date().toLocaleDateString('es-PE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
                : viewMode === 'last7days'
                  ? 'Últimos 7 días'
                  : new Date(selectedMonth + '-01').toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long'
                  })
              }
            </p>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('today')}
            >
              Hoy
            </Button>
            <Button
              variant={viewMode === 'last7days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('last7days')}
            >
              Últimos 7 días
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Mes
            </Button>

            {viewMode === 'month' && (
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-44"
              />
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message || 'Error al cargar los datos'}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-8 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Date Range Filters */}
        {
          !isLoading && filteredByDate.length > 0 && (
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
            </FilterBar>
          )
        }

        {/* Grid layout (3x3) mapping: 1..3 = KPI cards, 4 = Charts Grid, 5-7 placeholders */}
        {!isLoading && filteredByDate.length > 0 && (
          <div className="grid grid-cols-3 gap-4 auto-rows-[minmax(12rem,auto)] items-stretch">
            <div>
              <StatsCard
                title={
                  viewMode === 'today'
                    ? 'Total Daños Hoy'
                    : viewMode === 'last7days'
                      ? 'Total Últimos 7 Días'
                      : 'Total Daños del Mes'
                }
                subtitle={"\u00A0"}
                value={stats.total}
                icon={Luggage}
                description={
                  viewMode === 'today'
                    ? new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long' })
                    : viewMode === 'last7days'
                      ? 'Últimos 7 días'
                      : new Date(selectedMonth + '-01').toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
                }
              />
            </div>

            <div className="">
              <StatsCard
                title="Tasa de Firmas"
                value={`${stats.signatureRate}%`}
                subtitle={`${stats.signedCount}/${stats.total}`}
                icon={Signature}
                trend={{ value: stats.signatureRate, isPositive: stats.signatureRate >= 80 }}
                description={stats.signatureRate >= 80 ? 'Buena tasa de firmas' : 'Se recomienda mejorar la tasa de firmas'}
              />
            </div>

            <div>
              <StatsCard
                title="Comparativa Turnos"
                value={stats.dominantShift}
                subtitle={`${stats.dominantShiftCount} vs ${stats.otherShiftCount}`}
                icon={Clock}
                description="Turno con más registros"
              />
            </div>

            <div className="col-span-3">
              <ChartLineTemporal
                data={filteredByDate}
                viewMode={viewMode}
                selectedMonth={selectedMonth}
              />
            </div>

            <div className="h-full">
              <ChartPieDonut data={signatureData} total={filteredByDate.length} />
            </div>

            <div className="col-span-2 row-span-2 h-full">
              <ChartBarMultiple data={shiftComparisonData} viewMode={viewMode} />
            </div>

            <div className="h-full">
              <ChartBarHorizontal data={topFlightsData} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {
          !isLoading && filteredByDate.length === 0 && (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <FileX className="h-16 w-16 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No hay registros</h3>
                  <p className="text-sm text-muted-foreground">
                    {viewMode === 'today'
                      ? 'No se encontraron daños registrados para el día de hoy.'
                      : viewMode === 'last7days'
                        ? 'No se encontraron daños registrados en los últimos 7 días.'
                        : `No se encontraron daños registrados para ${new Date(selectedMonth + '-01').toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}.`
                    }
                  </p>
                </div>
                {viewMode === 'today' && (
                  <Button
                    variant="outline"
                    onClick={() => setViewMode('month')}
                  >
                    Ver mes completo
                  </Button>
                )}
              </div>
            </Card>
          )
        }
      </div >
    </>
  )
}