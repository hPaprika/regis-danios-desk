import { useState, useMemo, useCallback } from "react"
import useSWR from "swr"
import { 
  Luggage, Plane, AlertTriangle, Signature, Clock, Camera, 
  FileX, Info, Eye, Check, X, AlertCircle, Pencil, Trash2 
} from "lucide-react"
import { StatsCard } from "@/components/stats-card"
import { ChartCard } from "@/components/chart-card"
import { FilterBar } from "@/components/filter-bar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts"
import supabase from "@/lib/supabase/client"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface UnifiedRecord {
  id: string
  source: 'counter' | 'siberia'
  codigo: string
  aerolinea: string | null
  vuelo: string | null
  categorias: string[] | null
  observacion: string | null
  fecha_hora: string
  usuario: string | null
  turno: 'BRC-ERC' | 'IRC-KRC' | null
  firma: boolean
  imagen_url: string | null
  created_at: string
  updated_at: string
}

interface TableFilters {
  search: string
  airlines: string[]
  categories: string[]
  shifts: string[]
  sources: string[]
  hasSignature: 'all' | 'yes' | 'no'
}

interface ChartFilter {
  type: 'airline' | 'category' | null
  value: string | null
}

interface DashboardFilters {
  dateFrom: string
  dateTo: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const AIRLINE_COLORS: Record<string, string> = {
  'LATAM': '#22088c',
  'SKY': '#6c2679',
  'JET SMART': '#003d6a',
  'AVIANCA': '#dc3024',
}

const CATEGORY_LABELS: Record<string, string> = {
  'A': 'Asa rota',
  'B': 'Maleta rota',
  'C': 'Rueda rota'
}

const CATEGORY_COLORS = ['#ef4444', '#3b82f6', '#10b981']

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getTodayRange = () => {
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0))
  const endOfDay = new Date(today.setHours(23, 59, 59, 999))
  return {
    start: startOfDay.toISOString(),
    end: endOfDay.toISOString()
  }
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'A': 'bg-red-100 text-red-800 border-red-300',
    'B': 'bg-blue-100 text-blue-800 border-blue-300',
    'C': 'bg-green-100 text-green-800 border-green-300'
  }
  return colors[category] || 'bg-gray-100 text-gray-800'
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ============================================================================
// MULTI-SELECT COMPONENT
// ============================================================================

interface MultiSelectProps {
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}

function MultiSelect({ options, value, onChange, placeholder = "Seleccionar..." }: MultiSelectProps) {
  const handleToggle = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter(v => v !== option)
      : [...value, option]
    onChange(newValue)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {value.length > 0 
            ? `${value.length} seleccionado${value.length > 1 ? 's' : ''}`
            : placeholder
          }
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={value.includes(option)}
            onCheckedChange={() => handleToggle(option)}
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ============================================================================
// HELPER FUNCTIONS FOR MONTH RANGE
// ============================================================================

const getMonthRange = (yearMonth: string) => {
  const [year, month] = yearMonth.split('-').map(Number)
  const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)
  return {
    start: startOfMonth.toISOString(),
    end: endOfMonth.toISOString()
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

// ============================================================================
// DATA FETCHER
// ============================================================================

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
      .from("unified_records")
      .select("*")
      .gte('fecha_hora', dateRange.start)
      .lte('fecha_hora', dateRange.end)
      .order("fecha_hora", { ascending: false })

    if (error) {
      console.error("Error fetching unified_records:", error)
      throw new Error(error.message)
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DashboardPage() {
  // State management
  const [filters, setFilters] = useState<DashboardFilters>({
    dateFrom: "",
    dateTo: "",
  })

  const [viewMode, setViewMode] = useState<'today' | 'month' | 'last7days'>('today')
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // Format: "YYYY-MM"
  )

  const { data: unifiedData = [], isLoading, error } = useSWR<UnifiedRecord[]>(
    `dashboard-unified-${viewMode}-${viewMode === 'month' ? selectedMonth : viewMode}`, 
    createUnifiedFetcher(viewMode, selectedMonth), 
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
    }
  )

  const [tableFilters, setTableFilters] = useState<TableFilters>({
    search: '',
    airlines: [],
    categories: [],
    shifts: [],
    sources: [],
    hasSignature: 'all'
  })

  const [activeChartFilter, setActiveChartFilter] = useState<ChartFilter>({
    type: null,
    value: null
  })

  const [selectedRecord, setSelectedRecord] = useState<UnifiedRecord | null>(null)
  const [editingRecord, setEditingRecord] = useState<UnifiedRecord | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<UnifiedRecord | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 20

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
    const counterRecords = filteredByDate.filter(r => r.source === 'counter')
    const siberiaRecords = filteredByDate.filter(r => r.source === 'siberia')
    
    // Top Airline
    const airlineCounts: Record<string, number> = {}
    counterRecords.forEach(r => {
      if (r.aerolinea) {
        airlineCounts[r.aerolinea] = (airlineCounts[r.aerolinea] || 0) + 1
      }
    })
    const topAirlineEntry = Object.entries(airlineCounts).sort((a, b) => b[1] - a[1])[0]
    const topAirline = topAirlineEntry ? { name: topAirlineEntry[0], count: topAirlineEntry[1] } : null

    // Top Category
    const categoryCounts: Record<string, number> = {}
    counterRecords.forEach(r => {
      r.categorias?.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
      })
    })
    const topCategoryEntry = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]
    const topCategory = topCategoryEntry 
      ? { code: topCategoryEntry[0], label: CATEGORY_LABELS[topCategoryEntry[0]], count: topCategoryEntry[1] }
      : null

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

    // Siberia count
    const siberiaCount = siberiaRecords.length
    
    return {
      total: totalRecords,
      topAirline,
      topCategory,
      signatureRate,
      signedCount,
      dominantShift,
      dominantShiftCount,
      otherShiftCount,
      siberiaCount
    }
  }, [filteredByDate])

  // Chart Data: Damages by Airline
  const damagesByAirline = useMemo(() => {
    const airlines: Record<string, number> = {}
    filteredByDate
      .filter(r => r.source === 'counter' && r.aerolinea)
      .forEach(record => {
        if (record.aerolinea) {
          airlines[record.aerolinea] = (airlines[record.aerolinea] || 0) + 1
        }
      })
    return Object.entries(airlines)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredByDate])

  // Chart Data: Damages by Category
  const damagesByCategory = useMemo(() => {
    const categories: Record<string, number> = {}
    filteredByDate
      .filter(r => r.source === 'counter' && r.categorias)
      .forEach(record => {
        record.categorias?.forEach(cat => {
          categories[cat] = (categories[cat] || 0) + 1
        })
      })
    return Object.entries(categories).map(([code, value]) => ({
      name: `${code} - ${CATEGORY_LABELS[code]}`,
      code,
      value
    }))
  }, [filteredByDate])

  // Chart Data: Temporal Trend (Last 7 Days)
  const temporalTrend = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
        counter: 0,
        siberia: 0
      }
    })

    unifiedData.forEach(record => {
      const recordDate = new Date(record.fecha_hora).toISOString().split('T')[0]
      const dayData = last7Days.find(d => d.date === recordDate)
      if (dayData) {
        if (record.source === 'counter') dayData.counter++
        else if (record.source === 'siberia') dayData.siberia++
      }
    })

    return last7Days
  }, [unifiedData])

  // Chart Data: Damages by Shift and Airline
  const damagesByShiftAndAirline = useMemo(() => {
    const data = [
      { shift: 'BRC-ERC (Mañana)', LATAM: 0, SKY: 0, 'JET SMART': 0, AVIANCA: 0 },
      { shift: 'IRC-KRC (Tarde)', LATAM: 0, SKY: 0, 'JET SMART': 0, AVIANCA: 0 }
    ]

    filteredByDate
      .filter(r => r.source === 'counter' && r.turno && r.aerolinea)
      .forEach(record => {
        const shiftIndex = record.turno === 'BRC-ERC' ? 0 : 1
        if (record.aerolinea && data[shiftIndex][record.aerolinea as keyof typeof data[0]] !== undefined) {
          (data[shiftIndex][record.aerolinea as keyof typeof data[0]] as number)
        }
      })

    return data
  }, [filteredByDate])

  // Handlers for chart interactions
  const handleAirlineClick = useCallback((airlineName: string) => {
    setActiveChartFilter({ type: 'airline', value: airlineName })
    setTableFilters(prev => ({
      ...prev,
      airlines: [airlineName]
    }))
    setTimeout(() => {
      document.getElementById('records-table')?.scrollIntoView({ 
        behavior: 'smooth' 
      })
    }, 100)
  }, [])

  const handleCategoryClick = useCallback((category: string) => {
    setActiveChartFilter({ type: 'category', value: category })
    setTableFilters(prev => ({
      ...prev,
      categories: [category]
    }))
    setTimeout(() => {
      document.getElementById('records-table')?.scrollIntoView({ 
        behavior: 'smooth' 
      })
    }, 100)
  }, [])

  // Table filtering logic
  const filteredRecords = useMemo(() => {
    return filteredByDate.filter(record => {
      if (tableFilters.search && !record.codigo.includes(tableFilters.search)) {
        return false
      }

      if (tableFilters.airlines.length > 0 && record.aerolinea) {
        if (!tableFilters.airlines.includes(record.aerolinea)) return false
      }

      if (tableFilters.categories.length > 0 && record.categorias) {
        const hasCategory = tableFilters.categories.some(cat => 
          record.categorias?.includes(cat)
        )
        if (!hasCategory) return false
      }

      if (tableFilters.shifts.length > 0 && record.turno) {
        if (!tableFilters.shifts.includes(record.turno)) return false
      }

      if (tableFilters.sources.length > 0) {
        if (!tableFilters.sources.includes(record.source)) return false
      }

      if (tableFilters.hasSignature === 'yes' && !record.firma) return false
      if (tableFilters.hasSignature === 'no' && record.firma) return false

      return true
    })
  }, [filteredByDate, tableFilters])

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  )

  const handleViewDetails = (record: UnifiedRecord) => {
    setSelectedRecord(record)
  }

  const handleEdit = (record: UnifiedRecord) => {
    setEditingRecord(record)
  }

  const handleDelete = (record: UnifiedRecord) => {
    setDeletingRecord(record)
  }

  const confirmDelete = async () => {
    if (!deletingRecord) return

    try {
      const { error } = await supabase
        .rpc('delete_unified_record', {
          p_id: deletingRecord.id,
          p_source: deletingRecord.source
        })

      if (error) throw error

      // Revalidar datos
      alert('Registro eliminado exitosamente')
      setDeletingRecord(null)
      window.location.reload()
    } catch (error) {
      console.error('Error al eliminar:', error)
      alert('Error al eliminar el registro')
    }
  }

  const handleSaveEdit = async () => {
    if (!editingRecord) return

    try {
      const { error } = await supabase
        .rpc('update_unified_record', {
          p_id: editingRecord.id,
          p_source: editingRecord.source,
          p_codigo: editingRecord.codigo,
          p_aerolinea: editingRecord.aerolinea,
          p_vuelo: editingRecord.vuelo,
          p_categorias: editingRecord.categorias,
          p_observacion: editingRecord.observacion,
          p_turno: editingRecord.turno,
          p_firma: editingRecord.firma,
          p_usuario: editingRecord.usuario,
        })

      if (error) throw error

      alert('Registro actualizado exitosamente')
      setEditingRecord(null)
      window.location.reload()
    } catch (error) {
      console.error('Error al actualizar:', error)
      alert('Error al actualizar el registro')
    }
  }

  const handleReset = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
    })
  }
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
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
          {[1,2,3,4,5,6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-8 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* KPIs - 6 Cards */}
      {!isLoading && filteredByDate.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Card 1: Total Daños */}
          <StatsCard
            title={
              viewMode === 'today' 
                ? 'Total Daños Hoy' 
                : viewMode === 'last7days'
                ? 'Total Últimos 7 Días'
                : 'Total Daños del Mes'
            }
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

          {/* Card 2: Aerolínea Top */}
          {stats.topAirline && (
            <StatsCard
              title="Aerolínea con Más Daños"
              value={stats.topAirline.name}
              subtitle={`${stats.topAirline.count} daños`}
              icon={Plane}
              description={
                viewMode === 'today' ? 'Líder del día' : viewMode === 'last7days' ? 'Líder de la semana' : 'Líder del mes'
              }
            />
          )}

          {/* Card 3: Categoría Top */}
          {stats.topCategory && (
            <StatsCard
              title="Tipo de Daño Frecuente"
              value={stats.topCategory.label}
              subtitle={`${stats.topCategory.count} casos`}
              icon={AlertTriangle}
              description="Categoría predominante"
            />
          )}

          {/* Card 4: Tasa de Firmas */}
          <StatsCard
            title="Tasa de Firmas"
            value={`${stats.signatureRate}%`}
            subtitle={`${stats.signedCount}/${stats.total}`}
            icon={Signature}
            description={stats.signatureRate >= 80 ? "✓ Objetivo cumplido" : "⚠ Por debajo del objetivo"}
            trend={{ value: stats.signatureRate, isPositive: stats.signatureRate >= 80 }}
          />

          {/* Card 5: Turnos */}
          <StatsCard
            title="Comparativa Turnos"
            value={stats.dominantShift}
            subtitle={`${stats.dominantShiftCount} vs ${stats.otherShiftCount}`}
            icon={Clock}
            description="Turno con más registros"
          />

          {/* Card 6: Casos Siberia */}
          <StatsCard
            title="Casos Severos"
            value={stats.siberiaCount}
            subtitle="Con fotografía"
            icon={Camera}
            description="Registros Siberia"
          />
        </div>
      )}

      {/* Date Range Filters */}
      {!isLoading && filteredByDate.length > 0 && (
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
      )}

      {/* Charts Grid */}
      {!isLoading && filteredByDate.length > 0 && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Chart 1: Damages by Airline */}
            <ChartCard title="Daños por Aerolínea" description="Distribución de maletas dañadas (clic para filtrar)">
              {damagesByAirline.length === 0 ? (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  Sin datos disponibles
                </div>
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
                    <Bar 
                      dataKey="value" 
                      radius={[8, 8, 0, 0]}
                      onClick={(data: any) => handleAirlineClick(data.name)}
                      cursor="pointer"
                    >
                      {damagesByAirline.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={AIRLINE_COLORS[entry.name] || '#64748b'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Chart 2: Damages by Category */}
            <ChartCard title="Daños por Categoría" description="Categorización de daños (clic para filtrar)">
              {damagesByCategory.length === 0 ? (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  Sin datos disponibles
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={damagesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }: any) => 
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      dataKey="value"
                      onClick={(data: any) => handleCategoryClick(data.code)}
                      cursor="pointer"
                    >
                      {damagesByCategory.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.5rem",
                      }}
                      labelStyle={{ color: "var(--foreground)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* Chart 3: Temporal Trend - Full Width */}
          <ChartCard title="Tendencia Últimos 7 Días" description="Evolución de daños en la última semana">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={temporalTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" />
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
          </ChartCard>

          {/* Chart 4: Damages by Shift and Airline - Full Width */}
          <ChartCard title="Daños por Turno y Aerolínea" description="Distribución por turno y aerolínea">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={damagesByShiftAndAirline}>
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
                <Bar dataKey="LATAM" stackId="a" fill={AIRLINE_COLORS.LATAM} />
                <Bar dataKey="SKY" stackId="a" fill={AIRLINE_COLORS.SKY} />
                <Bar dataKey="JET SMART" stackId="a" fill={AIRLINE_COLORS['JET SMART']} />
                <Bar dataKey="AVIANCA" stackId="a" fill={AIRLINE_COLORS.AVIANCA} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Active Chart Filter Alert */}
          {activeChartFilter.type && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Filtrando por {activeChartFilter.type === 'airline' ? 'aerolínea' : 'categoría'}: 
                <strong> {activeChartFilter.value}</strong>
                <Button 
                  size="sm" 
                  variant="link"
                  onClick={() => {
                    setActiveChartFilter({ type: null, value: null })
                    setTableFilters(prev => ({
                      ...prev,
                      airlines: [],
                      categories: []
                    }))
                  }}
                >
                  Limpiar filtro
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Records Table */}
          <Card id="records-table">
            <CardHeader>
              <CardTitle>Registros Detallados</CardTitle>
              <CardDescription>
                {filteredRecords.length} registros encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Table Filters */}
              <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg mb-4">
                <div className="flex-1 min-w-[200px]">
                  <Label>Buscar por código</Label>
                  <Input 
                    placeholder="Ej: 123456" 
                    value={tableFilters.search}
                    onChange={(e) => setTableFilters({...tableFilters, search: e.target.value})}
                  />
                </div>

                <div className="min-w-[150px]">
                  <Label>Aerolíneas</Label>
                  <MultiSelect 
                    options={['LATAM', 'SKY', 'JET SMART', 'AVIANCA']}
                    value={tableFilters.airlines}
                    onChange={(val) => setTableFilters({...tableFilters, airlines: val})}
                  />
                </div>

                <div className="min-w-[120px]">
                  <Label>Categorías</Label>
                  <MultiSelect 
                    options={['A', 'B', 'C']}
                    value={tableFilters.categories}
                    onChange={(val) => setTableFilters({...tableFilters, categories: val})}
                  />
                </div>

                <div className="min-w-[120px]">
                  <Label>Turnos</Label>
                  <MultiSelect 
                    options={['BRC-ERC', 'IRC-KRC']}
                    value={tableFilters.shifts}
                    onChange={(val) => setTableFilters({...tableFilters, shifts: val})}
                  />
                </div>

                <div className="min-w-[120px]">
                  <Label>Origen</Label>
                  <Select 
                    value={tableFilters.sources[0] || 'all'}
                    onValueChange={(val) => setTableFilters({
                      ...tableFilters, 
                      sources: val === 'all' ? [] : [val]
                    })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="counter">Counter</SelectItem>
                      <SelectItem value="siberia">Siberia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setTableFilters({
                      search: '', airlines: [], categories: [], 
                      shifts: [], sources: [], hasSignature: 'all'
                    })}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Aerolínea</TableHead>
                    <TableHead>Vuelo</TableHead>
                    <TableHead>Categorías</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead>Firma</TableHead>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-sm">{record.codigo}</TableCell>
                      
                      <TableCell>
                        <Badge variant={record.source === 'counter' ? 'default' : 'secondary'}>
                          {record.source === 'counter' ? 'Counter' : 'Siberia'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        {record.aerolinea ? (
                          <span 
                            className="font-semibold px-2 py-1 rounded text-xs"
                            style={{ 
                              backgroundColor: `${AIRLINE_COLORS[record.aerolinea]}20`,
                              color: AIRLINE_COLORS[record.aerolinea]
                            }}
                          >
                            {record.aerolinea}
                          </span>
                        ) : '-'}
                      </TableCell>
                      
                      <TableCell>{record.vuelo || '-'}</TableCell>
                      
                      <TableCell>
                        {record.categorias?.length ? (
                          <div className="flex gap-1">
                            {record.categorias.map((cat: string) => (
                              <Badge 
                                key={cat} 
                                variant="outline"
                                className={getCategoryColor(cat)}
                              >
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        ) : '-'}
                      </TableCell>
                      
                      <TableCell>{record.usuario || 'Sin asignar'}</TableCell>
                      
                      <TableCell>
                        {record.turno ? (
                          <Badge variant="outline">{record.turno}</Badge>
                        ) : '-'}
                      </TableCell>
                      
                      <TableCell>
                        {record.firma ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                      
                      <TableCell className="text-sm">
                        {formatDateTime(record.fecha_hora)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleViewDetails(record)}
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEdit(record)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDelete(record)}
                            title="Eliminar"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando {paginatedRecords.length} de {filteredRecords.length} registros
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!isLoading && filteredByDate.length === 0 && (
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
      )}

      {/* Dialog for Edit Record */}
      <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
            <DialogDescription>
              {editingRecord?.source === 'counter' ? 'Counter' : 'Siberia'} - 
              Código: {editingRecord?.codigo}
            </DialogDescription>
          </DialogHeader>

          {editingRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Código</Label>
                  <Input 
                    value={editingRecord.codigo}
                    onChange={(e) => setEditingRecord({...editingRecord, codigo: e.target.value})}
                  />
                </div>

                {editingRecord.source === 'counter' && (
                  <>
                    <div>
                      <Label>Aerolínea</Label>
                      <Select 
                        value={editingRecord.aerolinea || ''}
                        onValueChange={(val) => setEditingRecord({...editingRecord, aerolinea: val})}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LATAM">LATAM</SelectItem>
                          <SelectItem value="SKY">SKY</SelectItem>
                          <SelectItem value="JET SMART">JET SMART</SelectItem>
                          <SelectItem value="AVIANCA">AVIANCA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Vuelo</Label>
                      <Input 
                        value={editingRecord.vuelo || ''}
                        onChange={(e) => setEditingRecord({...editingRecord, vuelo: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label>Turno</Label>
                      <Select 
                        value={editingRecord.turno || ''}
                        onValueChange={(val) => setEditingRecord({...editingRecord, turno: val as 'BRC-ERC' | 'IRC-KRC'})}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRC-ERC">BRC-ERC</SelectItem>
                          <SelectItem value="IRC-KRC">IRC-KRC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div>
                  <Label>Usuario</Label>
                  <Input 
                    value={editingRecord.usuario || ''}
                    onChange={(e) => setEditingRecord({...editingRecord, usuario: e.target.value})}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    checked={editingRecord.firma}
                    onChange={(e) => setEditingRecord({...editingRecord, firma: e.target.checked})}
                    className="h-4 w-4"
                  />
                  <Label>Firma</Label>
                </div>
              </div>

              <div>
                <Label>Observaciones</Label>
                <textarea 
                  value={editingRecord.observacion || ''}
                  onChange={(e) => setEditingRecord({...editingRecord, observacion: e.target.value})}
                  className="w-full min-h-[100px] p-2 border rounded-md"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRecord(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Delete Confirmation */}
      <Dialog open={!!deletingRecord} onOpenChange={() => setDeletingRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este registro?
            </DialogDescription>
          </DialogHeader>

          {deletingRecord && (
            <div className="space-y-2">
              <p><strong>Código:</strong> {deletingRecord.codigo}</p>
              <p><strong>Origen:</strong> {deletingRecord.source === 'counter' ? 'Counter' : 'Siberia'}</p>
              {deletingRecord.aerolinea && <p><strong>Aerolínea:</strong> {deletingRecord.aerolinea}</p>}
              {deletingRecord.vuelo && <p><strong>Vuelo:</strong> {deletingRecord.vuelo}</p>}
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Esta acción no se puede deshacer.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingRecord(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Record Details */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Registro</DialogTitle>
            <DialogDescription>
              {selectedRecord?.source === 'counter' ? 'Counter' : 'Siberia'} - 
              Código: {selectedRecord?.codigo}
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Código</Label>
                  <p className="font-mono text-lg">{selectedRecord.codigo}</p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Origen</Label>
                  <Badge variant={selectedRecord.source === 'counter' ? 'default' : 'secondary'}>
                    {selectedRecord.source}
                  </Badge>
                </div>

                {selectedRecord.aerolinea && (
                  <div>
                    <Label className="text-muted-foreground">Aerolínea</Label>
                    <p 
                      className="font-semibold px-2 py-1 rounded inline-block"
                      style={{
                        backgroundColor: `${AIRLINE_COLORS[selectedRecord.aerolinea]}20`,
                        color: AIRLINE_COLORS[selectedRecord.aerolinea]
                      }}
                    >
                      {selectedRecord.aerolinea}
                    </p>
                  </div>
                )}

                {selectedRecord.vuelo && (
                  <div>
                    <Label className="text-muted-foreground">Vuelo</Label>
                    <p className="font-semibold">{selectedRecord.vuelo}</p>
                  </div>
                )}

                {selectedRecord.categorias && selectedRecord.categorias.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Categorías</Label>
                    <div className="flex gap-2 mt-1">
                      {selectedRecord.categorias.map(cat => (
                        <Badge 
                          key={cat}
                          className={getCategoryColor(cat)}
                        >
                          {cat} - {CATEGORY_LABELS[cat]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRecord.usuario && (
                  <div>
                    <Label className="text-muted-foreground">Usuario</Label>
                    <p>{selectedRecord.usuario}</p>
                  </div>
                )}

                {selectedRecord.turno && (
                  <div>
                    <Label className="text-muted-foreground">Turno</Label>
                    <Badge variant="outline">{selectedRecord.turno}</Badge>
                  </div>
                )}

                <div>
                  <Label className="text-muted-foreground">Firma</Label>
                  <div className="flex items-center gap-2">
                    {selectedRecord.firma ? (
                      <>
                        <Check className="h-5 w-5 text-green-600" />
                        <span className="text-green-600">Firmado</span>
                      </>
                    ) : (
                      <>
                        <X className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-500">Sin firma</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Fecha y Hora</Label>
                  <p>{formatDateTime(selectedRecord.fecha_hora)}</p>
                </div>
              </div>

              {selectedRecord.observacion && (
                <div>
                  <Label className="text-muted-foreground">Observaciones</Label>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">
                    {selectedRecord.observacion}
                  </p>
                </div>
              )}

              {selectedRecord.imagen_url && (
                <div>
                  <Label className="text-muted-foreground">Fotografía</Label>
                  <img 
                    src={selectedRecord.imagen_url}
                    alt={`Daño ${selectedRecord.codigo}`}
                    className="mt-2 rounded-lg w-full object-cover max-h-96"
                  />
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Creado: {formatDateTime(selectedRecord.created_at)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Actualizado: {formatDateTime(selectedRecord.updated_at)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setSelectedRecord(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
