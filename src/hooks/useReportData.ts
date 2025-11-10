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

const fetcher = async () => {
  const { data, error } = await supabase
    .from('unified_records')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching unified_records:', error);
    throw new Error(error.message);
  }
  return (data || []) as UnifiedRecord[];
};

export const useReportData = (month: string, year: string) => {
  const { data: allData = [], isLoading, error } = useSWR('unified-records', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const reportData = useMemo(() => {
    // Filtrar datos por mes y año
    const filteredData = allData.filter((record) => {
      const recordDate = new Date(record.fecha_hora);
      const recordMonth = String(recordDate.getMonth() + 1).padStart(2, '0');
      const recordYear = String(recordDate.getFullYear());
      return recordMonth === month && recordYear === year;
    });

    // Calcular estadísticas
    const stats = {
      total: filteredData.length,
      counter: filteredData.filter((r) => r.source === 'counter').length,
      siberia: filteredData.filter((r) => r.source === 'siberia').length,
      signed: filteredData.filter((r) => r.firma).length,
    };

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

    return {
      stats,
      byAirline,
      byCategory,
      topFlights,
      hasData: filteredData.length > 0,
    };
  }, [allData, month, year]);

  return {
    ...reportData,
    isLoading,
    error,
  };
};
