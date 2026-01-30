import { useMemo } from 'react';
import useSWR from 'swr';
import supabase from '@/lib/supabase/client';

interface SiberiaRecord {
  id: string;
  codigo: string;
  vuelo: string;
  fecha_hora: string;
  imagen_url: string;
  firma: boolean;
  observacion: string;
  turno: string;
  created_at: string;
  updated_at: string;
}

type PeriodType = 'day' | 'week' | 'month' | 'year'

interface DateRange {
  start: string
  end: string
}

const getDateRange = (periodType: PeriodType, value: string): DateRange => {
  switch (periodType) {
    case 'day': {
      // value format: "YYYY-MM-DD"
      const date = new Date(value)
      const start = new Date(date.setHours(0, 0, 0, 0))
      const end = new Date(date.setHours(23, 59, 59, 999))
      return { start: start.toISOString(), end: end.toISOString() }
    }
    case 'week': {
      // value format: "YYYY-Www" (e.g., "2025-W45")
      const [year, week] = value.split('-W').map(Number)
      const firstDayOfYear = new Date(year, 0, 1)
      const daysOffset = (week - 1) * 7
      const weekStart = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + daysOffset))
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      return { start: weekStart.toISOString(), end: weekEnd.toISOString() }
    }
    case 'month': {
      // value format: "YYYY-MM"
      const [year, month] = value.split('-').map(Number)
      const start = new Date(year, month - 1, 1, 0, 0, 0, 0)
      const end = new Date(year, month, 0, 23, 59, 59, 999)
      return { start: start.toISOString(), end: end.toISOString() }
    }
    case 'year': {
      // value format: "YYYY"
      const year = Number(value)
      const start = new Date(year, 0, 1, 0, 0, 0, 0)
      const end = new Date(year, 11, 31, 23, 59, 59, 999)
      return { start: start.toISOString(), end: end.toISOString() }
    }
  }
}

const createFetcher = (periodType: PeriodType, periodValue: string) => async () => {
  const dateRange = getDateRange(periodType, periodValue)

  const { data, error } = await supabase
    .from('siberia')
    .select('*')
    .gte('fecha_hora', dateRange.start)
    .lte('fecha_hora', dateRange.end)
    .order('fecha_hora', { ascending: false })

  if (error) {
    console.error('Error fetching siberia records:', error)
    throw new Error(error.message)
  }
  return (data || []) as SiberiaRecord[]
}


export const useReportData = (periodType: PeriodType, periodValue: string) => {
  const { data: filteredData = [], isLoading, error } = useSWR(
    `report-${periodType}-${periodValue}`,
    createFetcher(periodType, periodValue),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  const reportData = useMemo(() => {
    // Calcular estadísticas básicas
    const signedCount = filteredData.filter((r) => r.firma).length
    const signatureRate = filteredData.length > 0 ? Math.round((signedCount / filteredData.length) * 100) : 0

    // Separar registros críticos (sin firma) y normales (con firma)
    const criticalRecords = filteredData.filter((r) => !r.firma)
    const normalRecords = filteredData.filter((r) => r.firma)

    // Turnos
    const shiftCounts: Record<string, number> = { 'BRC-ERC': 0, 'IRC-KRC': 0 }
    filteredData.forEach(r => {
      if (r.turno && shiftCounts[r.turno] !== undefined) {
        shiftCounts[r.turno]++
      }
    })
    const dominantShift = shiftCounts['BRC-ERC'] >= shiftCounts['IRC-KRC'] ? 'BRC-ERC' : 'IRC-KRC'

    const stats = {
      total: filteredData.length,
      signed: signedCount,
      signatureRate,
      dominantShift,
      shiftCounts,
      topAirline: { name: 'LATAM', count: filteredData.length }, // Solo LATAM
      criticalCount: criticalRecords.length, // Casos críticos
    }

    // Datos por turno para gráfico
    const byShift = [
      { name: 'BRC-ERC', value: shiftCounts['BRC-ERC'] },
      { name: 'IRC-KRC', value: shiftCounts['IRC-KRC'] },
    ]

    // Top vuelos con más daños
    const flightMap = new Map<string, number>();
    filteredData.forEach((record) => {
      if (record.vuelo) {
        const count = flightMap.get(record.vuelo) || 0;
        flightMap.set(record.vuelo, count + 1);
      }
    });
    const topFlights = Array.from(flightMap.entries())
      .map(([flight, damages]) => ({ flight, damages }))
      .sort((a, b) => b.damages - a.damages)
      .slice(0, 5);

    // Vuelo con más daños para KPI
    const topFlight = topFlights.length > 0 ? topFlights[0] : null

    return {
      stats: {
        ...stats,
        topFlight,
      },
      byShift,
      topFlights,
      hasData: filteredData.length > 0,
      rawData: filteredData,
      criticalRecords, // Registros sin firma
      normalRecords, // Registros con firma
    }
  }, [filteredData])

  return {
    ...reportData,
    isLoading,
    error,
  };
};
