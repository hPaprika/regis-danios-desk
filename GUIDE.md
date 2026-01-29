# Instrucciones de Implementación - Página de Reportes TALMA

## 🎯 Objetivo
Implementar una página de reportes con DOS tipos de reporte que se generan manualmente al pulsar un botón:
1. **Reporte Completo**: Análisis con métricas y gráficos (para uso interno)
2. **Reporte Diario Compacto**: Imagen optimizada para WhatsApp (para compartir)

## 🎨 Especificaciones de Diseño

### Colores Corporativos TALMA
- **Azul Principal**: `#003B7A` (Header y elementos principales)
- **Azul Oscuro**: `#002855` (Degradados y backgrounds)
- **Verde TALMA**: `#8DC63F` (Acentos y detalles positivos)
- **Blanco**: `#FFFFFF` (Texto en fondos oscuros)

### Paleta de Estados
- **Verde (Óptimo)**: `#10b981` / `emerald-500`
- **Amarillo (Aceptable)**: `#f59e0b` / `amber-500`
- **Rojo (Crítico)**: `#ef4444` / `red-500`

## 📋 Requerimientos Técnicos

### Dependencias Necesarias(ya instalado)
```bash
pnpm add html2canvas jspdf
```

## 🔧 Pasos de Implementación

### Paso 1: Crear el Contenedor Principal (reports-page.jsx)

Crea `reports-page.jsx` que contendrá ambos reportes con tabs/pestañas:

```jsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Image, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('full');
  const [isGenerating, setIsGenerating] = useState(false);

  // Función para descargar Reporte Completo como PDF
  const downloadFullReportPDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById('full-report');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      
      const today = new Date().toISOString().split('T')[0];
      pdf.save(`reporte-completo-talma-${today}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el reporte');
    } finally {
      setIsGenerating(false);
    }
  };

  // Función para descargar Reporte Compacto como imagen
  const downloadCompactReportImage = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById('compact-report');
      const canvas = await html2canvas(element, {
        scale: 2, // Para mejor calidad (1080x1080)
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Convertir a imagen y descargar
      const link = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      link.download = `reporte-diario-talma-${today}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error al generar imagen:', error);
      alert('Error al generar la imagen');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="text-muted-foreground">
            Genera y descarga reportes de equipajes dañados
          </p>
        </div>
      </div>

      {/* Tabs para alternar entre reportes */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="full" className="gap-2">
              <FileText className="w-4 h-4" />
              Reporte Completo
            </TabsTrigger>
            <TabsTrigger value="compact" className="gap-2">
              <Image className="w-4 h-4" />
              Reporte Compacto
            </TabsTrigger>
          </TabsList>

          {/* Botón de descarga según el tab activo */}
          {activeTab === 'full' && (
            <Button 
              onClick={downloadFullReportPDF}
              disabled={isGenerating}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {isGenerating ? 'Generando...' : 'Descargar PDF'}
            </Button>
          )}
          {activeTab === 'compact' && (
            <Button 
              onClick={downloadCompactReportImage}
              disabled={isGenerating}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {isGenerating ? 'Generando...' : 'Descargar Imagen'}
            </Button>
          )}
        </div>

        <TabsContent value="full">
          <FullReport />
        </TabsContent>

        <TabsContent value="compact">
          <CompactReport />
        </TabsContent>
      </Tabs>

      {/* Información de uso */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Cómo usar los reportes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <div>
            <strong>Reporte Completo (PDF):</strong> Análisis detallado con gráficos y métricas. Ideal para reuniones, auditorías y análisis interno. Permite personalizar fechas y filtros.
          </div>
          <div>
            <strong>Reporte Compacto (Imagen):</strong> Resumen visual de últimos 7 días optimizado para compartir en WhatsApp, Telegram o email. Formato 1080x1080px.
          </div>
          <div className="pt-2 border-t">
            <strong>Responsabilidad del usuario:</strong> Los reportes se generan con los datos más recientes al momento de pulsar el botón de descarga.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
```

### Paso 2: Crear Componente Reporte Completo

```jsx
// IMPORTANTE: Cambiar los colores a los de TALMA según se indicó antes:
// - Header: bg-gradient-to-r from-[#003B7A] to-[#002855]
// - Acentos verdes: usar #8DC63F donde sea apropiado
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const AirportDamageReport = () => {
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-01-15');

  // Datos de ejemplo - en producción vendrían de tu API
  const reportData = {
    period: `${new Date(dateFrom).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} - ${new Date(dateTo).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    totalDamages: 47,
    signatureRate: 85.1,
    avgDailyDamages: 3.1,
    dominantShift: 'Mañana',
    topAirline: 'LA2045',
    trend: -12, // % cambio vs período anterior
  };

  const getStatusColor = (value, threshold, inverse = false) => {
    if (inverse) {
      return value <= threshold ? 'bg-emerald-500' : value <= threshold * 1.5 ? 'bg-amber-500' : 'bg-red-500';
    }
    return value >= threshold ? 'bg-emerald-500' : value >= threshold * 0.7 ? 'bg-amber-500' : 'bg-red-500';
  };

  const getStatusText = (value, threshold, inverse = false) => {
    if (inverse) {
      return value <= threshold ? 'ÓPTIMO' : value <= threshold * 1.5 ? 'ACEPTABLE' : 'CRÍTICO';
    }
    return value >= threshold ? 'ÓPTIMO' : value >= threshold * 0.7 ? 'ACEPTABLE' : 'CRÍTICO';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="w-8 h-8" />;
    if (trend < 0) return <TrendingDown className="w-8 h-8" />;
    return <Minus className="w-8 h-8" />;
  };

  const downloadReport = () => {
    const reportElement = document.getElementById('damage-report');
    // Aquí implementarías la lógica de descarga (html2canvas + jsPDF)
    alert('Función de descarga - Implementar con html2canvas y jsPDF');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="date-from">Fecha Inicio</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="date-to">Fecha Fin</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <Button onClick={downloadReport} className="gap-2">
                <Download className="w-4 h-4" />
                Descargar Reporte
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Visual Report */}
        <div id="damage-report" className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">REPORTE DE EQUIPAJES DAÑADOS</h1>
                <p className="text-blue-100 text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {reportData.period}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">Aeropuerto</div>
                <div className="text-2xl font-bold">SIBERIA</div>
              </div>
            </div>
          </div>

          {/* Main Metrics Grid */}
          <div className="grid grid-cols-3 gap-6 p-8">
            {/* Total Damages */}
            <div className="relative">
              <div className="bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border-2 border-slate-200">
                <div className="text-sm font-semibold text-slate-600 mb-2">TOTAL DAÑOS</div>
                <div className="text-6xl font-bold text-slate-800 mb-4">{reportData.totalDamages}</div>
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="text-sm">Promedio diario:</div>
                  <div className="font-semibold">{reportData.avgDailyDamages}</div>
                </div>
              </div>
              {/* Status Indicator */}
              <div className={`absolute -right-3 -top-3 ${getStatusColor(reportData.avgDailyDamages, 5, true)} text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg`}>
                {getStatusText(reportData.avgDailyDamages, 5, true)}
              </div>
            </div>

            {/* Signature Rate */}
            <div className="relative">
              <div className="bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border-2 border-slate-200">
                <div className="text-sm font-semibold text-slate-600 mb-2">TASA DE FIRMAS</div>
                <div className="text-6xl font-bold text-slate-800 mb-4">{reportData.signatureRate}%</div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full ${getStatusColor(reportData.signatureRate, 80)} transition-all duration-500`}
                    style={{ width: `${reportData.signatureRate}%` }}
                  />
                </div>
              </div>
              <div className={`absolute -right-3 -top-3 ${getStatusColor(reportData.signatureRate, 80)} text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg`}>
                {getStatusText(reportData.signatureRate, 80)}
              </div>
            </div>

            {/* Trend */}
            <div className="relative">
              <div className="bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border-2 border-slate-200">
                <div className="text-sm font-semibold text-slate-600 mb-2">TENDENCIA</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${reportData.trend < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {getTrendIcon(reportData.trend)}
                  </div>
                  <div className="text-6xl font-bold text-slate-800">
                    {Math.abs(reportData.trend)}%
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  vs. período anterior
                </div>
              </div>
              <div className={`absolute -right-3 -top-3 ${reportData.trend < 0 ? 'bg-emerald-500' : reportData.trend === 0 ? 'bg-amber-500' : 'bg-red-500'} text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg`}>
                {reportData.trend < 0 ? 'MEJORA' : reportData.trend === 0 ? 'ESTABLE' : 'ALERTA'}
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 gap-6 px-8 pb-8">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="text-sm font-semibold text-slate-600 mb-3">TURNO DOMINANTE</div>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-slate-800">{reportData.dominantShift}</div>
                <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold">
                  Mayor actividad
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="text-sm font-semibold text-slate-600 mb-3">VUELO MÁS AFECTADO</div>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-slate-800">{reportData.topAirline}</div>
                <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg font-semibold">
                  Requiere atención
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-100 px-8 py-6 border-t-2 border-slate-200">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div>
                <span className="font-semibold">Generado:</span> {new Date().toLocaleString('es-PE')}
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span>Óptimo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>Aceptable</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Crítico</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend Card */}
        <Card>
          <CardHeader>
            <CardTitle>Criterios de Evaluación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold mb-2">Total Daños / Promedio Diario</div>
                <div className="space-y-1 text-slate-600">
                  <div>🟢 Óptimo: ≤ 5 daños/día</div>
                  <div>🟡 Aceptable: 5-7.5 daños/día</div>
                  <div>🔴 Crítico: &gt; 7.5 daños/día</div>
                </div>
              </div>
              <div>
                <div className="font-semibold mb-2">Tasa de Firmas</div>
                <div className="space-y-1 text-slate-600">
                  <div>🟢 Óptimo: ≥ 80%</div>
                  <div>🟡 Aceptable: 56-79%</div>
                  <div>🔴 Crítico: &lt; 56%</div>
                </div>
              </div>
              <div>
                <div className="font-semibold mb-2">Tendencia</div>
                <div className="space-y-1 text-slate-600">
                  <div>🟢 Mejora: Reducción de daños</div>
                  <div>🟡 Estable: Sin cambios</div>
                  <div>🔴 Alerta: Aumento de daños</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AirportDamageReport;
```

### Paso 3: Crear Componente Reporte Compacto

```jsx
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingDown, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const DailyWhatsAppReport = () => {
  // Datos de ejemplo - últimos 7 días
  const last7Days = [
    { date: '08 Ene', day: 'Mie', damages: 3, status: 'good' },
    { date: '09 Ene', day: 'Jue', damages: 5, status: 'good' },
    { date: '10 Ene', day: 'Vie', damages: 7, status: 'warning' },
    { date: '11 Ene', day: 'Sab', damages: 4, status: 'good' },
    { date: '12 Ene', day: 'Dom', damages: 2, status: 'good' },
    { date: '13 Ene', day: 'Lun', damages: 6, status: 'warning' },
    { date: '14 Ene', day: 'Mar', damages: 4, status: 'good' },
  ];

  const summary = {
    total: 31,
    average: 4.4,
    trend: -12, // % vs semana anterior
    signatureRate: 87,
    topFlight: 'LA2045',
  };

  const getBarColor = (damages) => {
    if (damages <= 5) return '#10b981'; // Verde
    if (damages <= 7) return '#f59e0b'; // Amarillo
    return '#ef4444'; // Rojo
  };

  const downloadImage = () => {
    alert('Descargando imagen optimizada para WhatsApp (1080x1080px)');
    // Aquí iría la lógica real de descarga
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 flex items-center justify-center">
      <div className="space-y-4">
        {/* Control para descargar */}
        <div className="flex justify-center">
          <Button onClick={downloadImage} size="lg" className="gap-2">
            <Download className="w-4 h-4" />
            Descargar para WhatsApp
          </Button>
        </div>

        {/* Imagen del Reporte - Tamaño WhatsApp optimizado */}
        <div 
          id="whatsapp-report" 
          className="bg-white rounded-none shadow-2xl overflow-hidden"
          style={{ width: '540px', height: '540px' }}
        >
          {/* Header TALMA */}
          <div 
            className="px-6 py-4 relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #003B7A 0%, #002855 100%)'
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h1 className="text-2xl font-bold text-white">TALMA</h1>
                  <p className="text-xs" style={{ color: '#8DC63F' }}>
                    EQUIPAJES DAÑADOS
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-white text-xs opacity-80">Reporte Diario</div>
                  <div className="text-white text-sm font-semibold">
                    15 ENE 2025
                  </div>
                </div>
              </div>
            </div>
            {/* Decoración */}
            <div 
              className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10"
              style={{ background: '#8DC63F' }}
            />
          </div>

          {/* Resumen Rápido */}
          <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b-2 border-slate-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">{summary.total}</div>
              <div className="text-xs text-slate-500">Total 7 días</div>
            </div>
            <div className="text-center border-x border-slate-200">
              <div className="text-2xl font-bold text-slate-800">{summary.average}</div>
              <div className="text-xs text-slate-500">Promedio/día</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-bold text-emerald-600">
                  {summary.signatureRate}%
                </span>
              </div>
              <div className="text-xs text-slate-500">Con firma</div>
            </div>
          </div>

          {/* Gráfico Principal */}
          <div className="px-4 py-3">
            <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center justify-between">
              <span>ÚLTIMOS 7 DÍAS</span>
              <span className="text-slate-400">(08 - 14 Ene)</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={last7Days}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 10]}
                />
                <Bar dataKey="damages" radius={[6, 6, 0, 0]}>
                  {last7Days.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.damages)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Indicadores de Estado */}
          <div className="px-4 py-3 space-y-2">
            {/* Tendencia */}
            <div className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500 rounded-full p-1">
                  <TrendingDown className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Tendencia</span>
              </div>
              <div className="text-sm font-bold text-emerald-700">
                {Math.abs(summary.trend)}% ↓
              </div>
            </div>

            {/* Estado Firmas */}
            <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500 rounded-full p-1">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Cumplimiento Firmas</span>
              </div>
              <div className="text-sm font-bold text-blue-700">
                {summary.signatureRate >= 80 ? 'ÓPTIMO' : 'REVISAR'}
              </div>
            </div>

            {/* Vuelo más afectado */}
            <div className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="bg-amber-500 rounded-full p-1">
                  <AlertCircle className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Vuelo más afectado</span>
              </div>
              <div className="text-sm font-bold text-amber-700">
                {summary.topFlight}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div 
            className="px-4 py-2 text-center border-t"
            style={{ backgroundColor: '#f8fafc' }}
          >
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>≤5 Óptimo</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>6-7 Alerta</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>&gt;7 Crítico</span>
              </div>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Generado: 15/01/2025 10:00 AM
            </div>
          </div>
        </div>

        {/* Info adicional */}
        <Card className="max-w-lg">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <div className="text-emerald-600 font-bold">✓</div>
                <div>
                  <strong>Formato optimizado:</strong> 540x540px para WhatsApp (se puede ajustar a 1080x1080 para mejor calidad)
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-emerald-600 font-bold">✓</div>
                <div>
                  <strong>Generación automática:</strong> Se genera cada día a las 10:00 AM con datos hasta el día anterior
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-emerald-600 font-bold">✓</div>
                <div>
                  <strong>Compacto y claro:</strong> Toda la información clave en un vistazo
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

```

### Paso 4: Conectar con Datos Reales de Supabase

En ambos componentes reemplaza los datos de ejemplo:

```jsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase'; // Ajusta la ruta según tu proyecto

// En FullReport.jsx
const FullReport = () => {
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-01-15');

  const { data: siberiaData, isLoading } = useQuery({
    queryKey: ['siberia-full-report', dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('siberia')
        .select('*')
        .gte('fecha_hora', dateFrom)
        .lte('fecha_hora', dateTo + 'T23:59:59')
        .order('fecha_hora', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const reportData = React.useMemo(() => {
    if (!siberiaData || siberiaData.length === 0) return null;
    return calculateReportMetrics(siberiaData, dateFrom, dateTo);
  }, [siberiaData, dateFrom, dateTo]);

  // ... resto del componente
};

// En CompactReport.jsx
const CompactReport = () => {
  const { data: siberiaData, isLoading } = useQuery({
    queryKey: ['siberia-compact-report'],
    queryFn: async () => {
      // Obtener últimos 7 días hasta ayer
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const endDate = yesterday.toISOString().split('T')[0];
      const startDate = new Date(yesterday);
      startDate.setDate(startDate.getDate() - 6);
      const start = startDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('siberia')
        .select('*')
        .gte('fecha_hora', start)
        .lte('fecha_hora', endDate + 'T23:59:59')
        .order('fecha_hora', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const { last7Days, summary } = React.useMemo(() => {
    if (!siberiaData) return { last7Days: [], summary: {} };
    return calculateCompactMetrics(siberiaData);
  }, [siberiaData]);

  // ... resto del componente
};
```

### Paso 5: Funciones Helper para Calcular Métricas

Crea un archivo `utils/reportMetrics.js`:

```jsx
// Calcular métricas para Reporte Completo
export const calculateReportMetrics = (data, dateFrom, dateTo) => {
  if (!data || data.length === 0) return null;

  const totalDamages = data.length;
  const signedCount = data.filter(d => d.firma === true).length;
  const signatureRate = ((signedCount / totalDamages) * 100).toFixed(1);
  
  // Calcular días en el período
  const start = new Date(dateFrom);
  const end = new Date(dateTo);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  const avgDailyDamages = (totalDamages / days).toFixed(1);
  
  // Turno dominante
  const shiftCounts = data.reduce((acc, d) => {
    acc[d.turno] = (acc[d.turno] || 0) + 1;
    return acc;
  }, {});
  const dominantShift = Object.keys(shiftCounts).reduce((a, b) => 
    shiftCounts[a] > shiftCounts[b] ? a : b
  );
  
  // Vuelo más afectado
  const flightCounts = data.reduce((acc, d) => {
    acc[d.vuelo] = (acc[d.vuelo] || 0) + 1;
    return acc;
  }, {});
  const topAirline = Object.keys(flightCounts).reduce((a, b) => 
    flightCounts[a] > flightCounts[b] ? a : b
  );
  
  // Calcular tendencia (comparar con período anterior de misma duración)
  // TODO: Implementar si es necesario
  const trend = 0;
  
  return {
    period: `${new Date(dateFrom).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} - ${new Date(dateTo).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    totalDamages,
    signatureRate: parseFloat(signatureRate),
    avgDailyDamages: parseFloat(avgDailyDamages),
    dominantShift,
    topAirline,
    trend
  };
};

// Calcular métricas para Reporte Compacto (últimos 7 días)
export const calculateCompactMetrics = (data) => {
  if (!data || data.length === 0) return { last7Days: [], summary: {} };

  // Agrupar por fecha
  const groupedByDate = data.reduce((acc, item) => {
    const date = new Date(item.fecha_hora).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  // Crear array de últimos 7 días
  const last7Days = Object.keys(groupedByDate)
    .sort()
    .slice(-7)
    .map(date => {
      const damages = groupedByDate[date].length;
      return {
        date: new Date(date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
        day: new Date(date).toLocaleDateString('es-PE', { weekday: 'short' }),
        damages,
        status: damages <= 5 ? 'good' : damages <= 7 ? 'warning' : 'critical'
      };
    });

  const totalDamages = data.length;
  const signedCount = data.filter(d => d.firma === true).length;
  const signatureRate = Math.round((signedCount / totalDamages) * 100);
  const average = (totalDamages / 7).toFixed(1);

  // Vuelo más afectado
  const flightCounts = data.reduce((acc, d) => {
    acc[d.vuelo] = (acc[d.vuelo] || 0) + 1;
    return acc;
  }, {});
  const topFlight = Object.keys(flightCounts).reduce((a, b) => 
    flightCounts[a] > flightCounts[b] ? a : b
  );

  return {
    last7Days,
    summary: {
      total: totalDamages,
      average: parseFloat(average),
      trend: 0, // TODO: calcular vs semana anterior si es necesario
      signatureRate,
      topFlight
    }
  };
};
```

### Paso 6: Aplicar Colores TALMA

En **FullReport.jsx**, actualiza el header:

```jsx
<div className="bg-linear-to-r from-[#003B7A] to-[#002855] text-white p-8">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-4xl font-bold mb-2">REPORTE DE EQUIPAJES DAÑADOS</h1>
      <p className="text-blue-100 text-lg flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        {reportData.period}
      </p>
    </div>
    <div className="text-right">
      <div className="text-sm" style={{ color: '#8DC63F' }}>Aeropuerto</div>
      <div className="text-2xl font-bold">TALMA</div>
    </div>
  </div>
</div>
```

CompactReport.jsx ya tiene los colores TALMA aplicados.

### Paso 7: Agregar Ruta en el Router

```jsx
import ReportsPage from './pages/reports/ReportsPage';

// En tus rutas:
<Route path="/reportes" element={<ReportsPage />} />
```

### Paso 8: Agregar al Menú de Navegación

```jsx
<Link to="/reportes">
  <Button variant="ghost" className="w-full justify-start">
    <FileText className="mr-2 h-4 w-4" />
    Reportes
  </Button>
</Link>
```

## ✅ Checklist de Implementación MVP

- [ ] ReportsPage.jsx creado con tabs
- [ ] FullReport.jsx creado y personalizado con colores TALMA
- [ ] CompactReport.jsx creado con colores TALMA
- [ ] Funciones de descarga PDF e Imagen funcionando
- [ ] Datos conectados desde Supabase
- [ ] Funciones calculateReportMetrics y calculateCompactMetrics implementadas
- [ ] Ruta /reportes agregada al router
- [ ] Enlace en navegación agregado
- [ ] Probado con datos reales
- [ ] Estados de loading manejados
- [ ] Librería html2canvas y jsPDF instaladas

## 🎨 Arquitectura Final

```
Página de Reportes
├── Tab 1: Reporte Completo
│   ├── Filtros de fecha personalizables
│   ├── Métricas detalladas
│   ├── Gráficos completos
│   └── Botón: Descargar PDF
│
└── Tab 2: Reporte Compacto
    ├── Últimos 7 días (automático hasta ayer)
    ├── Diseño optimizado WhatsApp
    ├── Gráfico de barras compacto
    └── Botón: Descargar Imagen PNG

Responsabilidad: Usuario pulsa botón para generar con datos actuales
```

## 🐛 Troubleshooting

**Problema**: La descarga no funciona o sale en blanco
- Verifica que los elementos tengan los IDs correctos: `full-report` y `compact-report`
- Asegúrate de que html2canvas tenga tiempo para renderizar (puedes agregar un pequeño delay)

**Problema**: Los datos no se cargan
- Verifica la conexión con Supabase
- Revisa la consola para errores de query
- Confirma que la tabla `siberia` exista y tenga datos

**Problema**: El PDF es muy grande
- Ajusta el `scale` en html2canvas (prueba con 1.5 en lugar de 2)
- Reduce la calidad de la imagen antes de agregar al PDF

## 📝 Notas para Producción Futura

Para cuando escales más allá del MVP:
- Implementar generación automática con cron job
- Agregar envío automático por email/WhatsApp API
- Agregar más filtros (por aerolínea, turno, etc.)
- Histórico de reportes generados
- Comparativa automática vs períodos anteriores