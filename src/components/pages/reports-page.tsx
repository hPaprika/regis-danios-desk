import { useState } from "react"
import { Printer, Package, FileText, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartCard } from "@/components/chart-card"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useReportData } from "@/hooks/useReportData"
import { downloadPDFReport } from "@/lib/pdf-generator"
import type { ReportData } from "@/components/pdf/ReportDocument"

const months = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
]

const getMonthName = (month: string) => {
  return months.find(m => m.value === month)?.label || 'Desconocido'
}

const years = [
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
]

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export function ReportsPage() {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(String(currentDate.getMonth() + 1).padStart(2, '0'))
  const [selectedYear, setSelectedYear] = useState(String(currentDate.getFullYear()))
  const [hasReport, setHasReport] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const { stats, byAirline, byCategory, topFlights, hasData, isLoading, error } = useReportData(
    selectedMonth,
    selectedYear
  )

  const handleGenerateReport = () => {
    setHasReport(true)
  }

  const handleDownloadPDF = async () => {
    if (!hasData) return

    setIsGeneratingPDF(true)
    try {
      const reportData: ReportData = {
        month: getMonthName(selectedMonth),
        year: selectedYear,
        stats,
        byAirline,
        byCategory,
        topFlights,
        generatedDate: new Date().toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }

      const filename = `reporte_${getMonthName(selectedMonth)}_${selectedYear}.pdf`
      await downloadPDFReport(reportData, filename)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar el reporte PDF. Por favor, intenta nuevamente.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reportes Mensuales</h1>
        <p className="text-muted-foreground">Análisis y estadísticas de maletas dañadas</p>
      </div>

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Selector de Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Mes</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Año</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerateReport} 
              className="w-full sm:w-auto bg-primary text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Cargando...
                </>
              ) : (
                'Generar Reporte'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-3 text-destructive">
              <Package className="h-5 w-5" />
              <div>
                <p className="font-semibold">Error al cargar los datos</p>
                <p className="text-sm">{error.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data Message */}
      {hasReport && !hasData && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No hay datos disponibles</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No se encontraron registros para {getMonthName(selectedMonth)} {selectedYear}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Report Content */}
      {hasReport && hasData && (
        <>
          {/* Report Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <CardTitle className="text-2xl">
                    {getMonthName(selectedMonth)} {selectedYear}
                  </CardTitle>
                  <CardDescription>Resumen del período</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownloadPDF} 
                    className="gap-2 bg-transparent"
                    disabled={isGeneratingPDF}
                  >
                    {isGeneratingPDF ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">
                      {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
                    </span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 bg-transparent">
                    <Printer className="h-4 w-4" />
                    <span className="hidden sm:inline">Imprimir</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1 rounded-lg border border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Total de Maletas</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="space-y-1 rounded-lg border border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Counter</p>
                  <p className="text-2xl font-bold text-foreground">{stats.counter}</p>
                </div>
                <div className="space-y-1 rounded-lg border border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Siberia</p>
                  <p className="text-2xl font-bold text-foreground">{stats.siberia}</p>
                </div>
                <div className="space-y-1 rounded-lg border border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Con Firma</p>
                  <p className="text-2xl font-bold text-foreground">{stats.signed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* By Airline */}
            <ChartCard title="Daños por Aerolínea" description="Distribución de maletas dañadas">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byAirline}>
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
            </ChartCard>

            {/* By Type */}
            <ChartCard title="Daños por Categoría" description="Categorización de daños">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {byCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            </ChartCard>

            {/* Top Flights */}
            <ChartCard title="Vuelos con Más Daños" description="Top 5 vuelos afectados" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topFlights} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" />
                  <YAxis dataKey="flight" type="category" stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.5rem",
                    }}
                    labelStyle={{ color: "var(--foreground)" }}
                  />
                  <Bar dataKey="damages" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {/* Initial State Message */}
      {!hasReport && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No hay reporte generado</h3>
            <p className="mt-2 text-sm text-muted-foreground">Selecciona un período y presiona "Generar Reporte"</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
