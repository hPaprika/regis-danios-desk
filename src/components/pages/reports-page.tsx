import { useState, useRef, useEffect } from "react"
import {
  FileSpreadsheet, Package, FileText, Loader
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useReportData } from "@/hooks/useReportData"
import { ReportPreview } from "@/components/report-preview"
import { generatePDF, generateCSV, getReportFileName } from "@/lib/export-utils"

type PeriodType = 'day' | 'week' | 'month' | 'year'

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
  const reportRef = useRef<HTMLDivElement>(null)

  // Calcular el día anterior (ayer) como fecha por defecto
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const [periodType, setPeriodType] = useState<PeriodType>('day')
  const [periodValue, setPeriodValue] = useState<string>(
    yesterday.toISOString().split('T')[0]
  )
  const [hasReport, setHasReport] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // Update period value when period type changes
  const handlePeriodTypeChange = (newType: PeriodType) => {
    setPeriodType(newType)
    const currentDate = new Date()
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

  const { hasData, isLoading, error, rawData } = useReportData(
    periodType,
    periodValue
  )

  // Auto-generar reporte cuando hay datos disponibles
  useEffect(() => {
    if (hasData && !isLoading) {
      setHasReport(true)
    }
  }, [hasData, isLoading])

  const handleGenerateReport = () => {
    setHasReport(true)
  }

  const handleDownloadPDF = async () => {
    if (!hasData || !reportRef.current || !rawData) return

    setIsGeneratingPDF(true)
    try {
      const fileName = getReportFileName(new Date(periodValue))
      generatePDF(reportRef.current, rawData, periodValue, fileName)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar el reporte PDF. Por favor, intenta nuevamente.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleDownloadCSV = () => {
    if (!hasData || !rawData) return

    try {
      const fileName = getReportFileName()
      generateCSV(rawData, fileName)
    } catch (error) {
      console.error('Error al generar CSV:', error)
      alert(`Error al generar el reporte CSV: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reportes - LATAM</h1>
        <p className="text-muted-foreground">Análisis y estadísticas de maletas dañadas</p>
      </div>

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Selector de Período</CardTitle>
          <CardDescription>Elige el tipo de período para generar el reporte</CardDescription>
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
      {hasReport && hasData && rawData && (
        <>
          {/* Report Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <CardTitle className="text-2xl">
                    {getPeriodLabel(periodType, periodValue)}
                  </CardTitle>
                  <CardDescription>Resumen del período seleccionado - LATAM</CardDescription>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadCSV}
                    className="gap-2 bg-transparent"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="hidden sm:inline">Descargar CSV</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Report Preview */}
          <Card>
            <CardContent className="p-6">
              <ReportPreview
                ref={reportRef}
                records={rawData}
                reportDate={periodValue}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* Initial State Message */}
      {!hasReport && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No hay reporte generado</h3>
            <p className="mt-2 text-sm text-muted-foreground">Selecciona una opcion y presiona "Generar Reporte"</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
