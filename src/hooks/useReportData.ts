import { useMemo } from 'react';
import useSWR from 'swr';
import supabase from '@/lib/supabase/client';

interface UnifiedRecord {
  id: string;
  source: 'counter' | 'siberia';
  codigo: string;
  aerolinea?: string;
  vuelo?: string;
  categorias?: string[];
  observacion?: string;
  fecha_hora: string;
  usuario?: string;
  turno?: string;
  firma: boolean;
  imagen_url?: string;
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
    .from('unified_records')
    .select('*')
    .gte('fecha_hora', dateRange.start)
    .lte('fecha_hora', dateRange.end)
    .order('fecha_hora', { ascending: false })

  if (error) {
    console.error('Error fetching unified_records:', error)
    throw new Error(error.message)
  }
  return (data || []) as UnifiedRecord[]
}

const CATEGORY_LABELS: Record<string, string> = {
  'A': 'Asa rota',
  'B': 'Maleta rota',
  'C': 'Rueda rota'
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
    const counterRecords = filteredData.filter((r) => r.source === 'counter')
    const siberiaRecords = filteredData.filter((r) => r.source === 'siberia')
    const signedCount = filteredData.filter((r) => r.firma).length
    const signatureRate = filteredData.length > 0 ? Math.round((signedCount / filteredData.length) * 100) : 0

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

    // Shifts
    const shiftCounts: Record<string, number> = { 'BRC-ERC': 0, 'IRC-KRC': 0 }
    filteredData.forEach(r => {
      if (r.turno && shiftCounts[r.turno] !== undefined) {
        shiftCounts[r.turno]++
      }
    })
    const dominantShift = shiftCounts['BRC-ERC'] >= shiftCounts['IRC-KRC'] ? 'BRC-ERC' : 'IRC-KRC'

    const stats = {
      total: filteredData.length,
      counter: counterRecords.length,
      siberia: siberiaRecords.length,
      signed: signedCount,
      signatureRate,
      topAirline,
      topCategory,
      dominantShift,
      shiftCounts,
    }

    // Agrupar por aerolínea
    const airlineMap = new Map<string, number>();
    filteredData.forEach((record) => {
      if (record.aerolinea) {
        const count = airlineMap.get(record.aerolinea) || 0;
        airlineMap.set(record.aerolinea, count + 1);
      }
    });
    const byAirline = Array.from(airlineMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Agrupar por categoría
    const categoryMap = new Map<string, number>();
    filteredData.forEach((record) => {
      if (record.categorias && Array.isArray(record.categorias)) {
        record.categorias.forEach((cat) => {
          const categoryName = `Categoría ${cat}`;
          const count = categoryMap.get(categoryName) || 0;
          categoryMap.set(categoryName, count + 1);
        });
      }
    });
    const byCategory = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Top vuelos con más daños
    const flightMap = new Map<string, { damages: number; airline?: string }>();
    filteredData.forEach((record) => {
      if (record.vuelo) {
        const current = flightMap.get(record.vuelo) || { damages: 0, airline: record.aerolinea };
        flightMap.set(record.vuelo, {
          damages: current.damages + 1,
          airline: current.airline || record.aerolinea,
        });
      }
    });
    const topFlights = Array.from(flightMap.entries())
      .map(([flight, data]) => ({ flight, ...data }))
      .sort((a, b) => b.damages - a.damages)
      .slice(0, 5);

    // Damages by Shift and Airline
    const damagesByShiftAndAirline = [
      { shift: 'BRC-ERC (Mañana)', LATAM: 0, SKY: 0, 'JET SMART': 0, AVIANCA: 0 },
      { shift: 'IRC-KRC (Tarde)', LATAM: 0, SKY: 0, 'JET SMART': 0, AVIANCA: 0 }
    ]
    counterRecords
      .filter(r => r.turno && r.aerolinea)
      .forEach(record => {
        const shiftIndex = record.turno === 'BRC-ERC' ? 0 : 1
        if (record.aerolinea && damagesByShiftAndAirline[shiftIndex][record.aerolinea as keyof typeof damagesByShiftAndAirline[0]] !== undefined) {
          (damagesByShiftAndAirline[shiftIndex][record.aerolinea as keyof typeof damagesByShiftAndAirline[0]] as number)++
        }
      })

    return {
      stats,
      byAirline,
      byCategory,
      topFlights,
      damagesByShiftAndAirline,
      hasData: filteredData.length > 0,
      rawData: filteredData,
    }
  }, [filteredData])

  return {
    ...reportData,
    isLoading,
    error,
  };
};
