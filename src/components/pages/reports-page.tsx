import { useState } from "react"
import {
  Printer, Package, FileText, Loader, Plane, AlertTriangle,
  Signature, Clock, Camera, Luggage, Mail
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatsCard } from "@/components/stats-card"
import { ChartCard } from "@/components/chart-card"
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"
import { useReportData } from "@/hooks/useReportData"
import { downloadPDFReport } from "@/lib/pdf-generator"
import type { ReportData } from "@/components/pdf/ReportDocument"
import { EmailReportDialog } from "@/components/modals/email-report-dialog"
import { sendReportEmail } from "@/lib/send-email"

type PeriodType = 'day' | 'week' | 'month' | 'year'

const AIRLINE_COLORS: Record<string, string> = {
  'LATAM': '#22088c',
  'SKY': '#6c2679',
  'JET SMART': '#003d6a',
  'AVIANCA': '#dc3024',
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFF", "#FF6666",];

// Helper function to get week number
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// Helper to format period label
const getPeriodLabel = (periodType: PeriodType, periodValue: string): string => {
  switch (periodType) {
    case 'day':
      return new Date(periodValue).toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    case 'week':
      const [year, week] = periodValue.split('-W')
      return `Semana ${week}, ${year}`
    case 'month':
      return new Date(periodValue + '-01').toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long'
      })
    case 'year':
      return `Año ${periodValue}`
  }
}

export function ReportsPage() {
  const currentDate = new Date()
  const [periodType, setPeriodType] = useState<PeriodType>('month')
  const [periodValue, setPeriodValue] = useState<string>(
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  )
  const [hasReport, setHasReport] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)

  // Update period value when period type changes
  const handlePeriodTypeChange = (newType: PeriodType) => {
    setPeriodType(newType)
    switch (newType) {
      case 'day':
        setPeriodValue(currentDate.toISOString().split('T')[0])
        break
      case 'week':
        const weekNumber = getWeekNumber(currentDate)
        setPeriodValue(`${currentDate.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`)
        break
      case 'month':
        setPeriodValue(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`)
        break
      case 'year':
        setPeriodValue(String(currentDate.getFullYear()))
        break
    }
  }

  const { stats, byAirline, byCategory, topFlights, damagesByShiftAndAirline, hasData, isLoading, error } = useReportData(
    periodType,
    periodValue
  )

  const handleGenerateReport = () => {
    setHasReport(true)
  }

  const handleDownloadPDF = async () => {
    if (!hasData) return

    setIsGeneratingPDF(true)
    try {
      const periodLabel = getPeriodLabel(periodType, periodValue)
      const reportData: ReportData = {
        month: periodLabel,
        year: '',
        stats,
        byAirline,
        byCategory,
        topFlights,
        generatedDate: new Date().toLocaleDateString('es-PE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }

      const filename = `reporte_${periodLabel.replace(/\s/g, '_')}.pdf`
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

  const handleSendEmail = async (email: string) => {
    if (!hasData) return

    const periodLabel = getPeriodLabel(periodType, periodValue)
    const generatedDate = new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    await sendReportEmail({
      to: email,
      subject: `Reporte de Daños - ${periodLabel}`,
      stats,
      byAirline,
      byCategory,
      topFlights,
      periodLabel,
      generatedDate,
    })
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reportes Personalizados</h1>
        <p className="text-muted-foreground">Análisis y estadísticas detalladas de maletas dañadas</p>
      </div>

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Selector de Período</CardTitle>
          <CardDescription>Elige el tipo de período y el rango para generar el reporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Period Type Selector */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={periodType === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePeriodTypeChange('day')}
              >
                Día
              </Button>
              <Button
                variant={periodType === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePeriodTypeChange('week')}
              >
                Semana
              </Button>
              <Button
                variant={periodType === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePeriodTypeChange('month')}
              >
                Mes
              </Button>
              <Button
                variant={periodType === 'year' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePeriodTypeChange('year')}
              >
                Año
              </Button>
            </div>

            {/* Period Value Selector */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
              <div className="flex flex-col gap-2 flex-1">
                <Label className="text-sm font-medium">
                  {periodType === 'day' && 'Selecciona el día'}
                  {periodType === 'week' && 'Selecciona la semana'}
                  {periodType === 'month' && 'Selecciona el mes'}
                  {periodType === 'year' && 'Selecciona el año'}
                </Label>
                <Input
                  type={periodType === 'day' ? 'date' : periodType === 'week' ? 'week' : periodType === 'month' ? 'month' : 'number'}
                  value={periodValue}
                  onChange={(e) => setPeriodValue(e.target.value)}
                  className="w-full sm:w-60"
                  min={periodType === 'year' ? '2020' : undefined}
                  max={periodType === 'year' ? '2030' : undefined}
                />
              </div>

              <Button
                onClick={handleGenerateReport}
                className="w-full sm:w-auto"
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
              No se encontraron registros para {getPeriodLabel(periodType, periodValue)}
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
                    {getPeriodLabel(periodType, periodValue)}
                  </CardTitle>
                  <CardDescription>Resumen del período seleccionado</CardDescription>
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEmailDialogOpen(true)} 
                    className="gap-2 bg-transparent"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="hidden sm:inline">Enviar Email</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* KPIs - 6 Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatsCard
              title="Total de Daños"
              value={stats.total}
              icon={Luggage}
              description={getPeriodLabel(periodType, periodValue)}
            />

            {stats.topAirline && (
              <StatsCard
                title="Aerolínea con Más Daños"
                value={stats.topAirline.name}
                subtitle={`${stats.topAirline.count} daños`}
                icon={Plane}
                description="Líder del período"
              />
            )}

            {stats.topCategory && (
              <StatsCard
                title="Tipo de Daño Frecuente"
                value={stats.topCategory.label}
                subtitle={`${stats.topCategory.count} casos`}
                icon={AlertTriangle}
                description="Categoría predominante"
              />
            )}

            <StatsCard
              title="Tasa de Firmas"
              value={`${stats.signatureRate}%`}
              subtitle={`${stats.signed}/${stats.total}`}
              icon={Signature}
              description={stats.signatureRate >= 80 ? "✓ Objetivo cumplido" : "⚠ Por debajo del objetivo"}
              trend={{ value: stats.signatureRate, isPositive: stats.signatureRate >= 80 }}
            />

            <StatsCard
              title="Comparativa Turnos"
              value={stats.dominantShift}
              subtitle={`${stats.shiftCounts[stats.dominantShift]} vs ${stats.shiftCounts[stats.dominantShift === 'BRC-ERC' ? 'IRC-KRC' : 'BRC-ERC']}`}
              icon={Clock}
              description="Turno con más registros"
            />

            <StatsCard
              title="Casos Severos"
              value={stats.siberia}
              subtitle="Con fotografía"
              icon={Camera}
              description="Registros Siberia"
            />
          </div>

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
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {byAirline.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={AIRLINE_COLORS[entry.name] || '#64748b'}
                      />
                    ))}
                  </Bar>
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

          {/* Stacked Bar Chart: Damages by Shift and Airline */}
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

      {/* Email Dialog */}
      <EmailReportDialog
        open={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        onSendEmail={handleSendEmail}
        reportPeriod={getPeriodLabel(periodType, periodValue)}
      />
    </div>
  )
}
