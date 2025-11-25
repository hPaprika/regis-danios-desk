import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useReportData } from '../useReportData'
import { mockUnifiedRecords } from '@/test/mocks/supabase'

// Mock de SWR
vi.mock('swr', () => ({
  default: vi.fn((key, fetcher) => {
    // Simular que SWR llama al fetcher inmediatamente
    const data = fetcher ? fetcher() : Promise.resolve([])
    return {
      data: mockUnifiedRecords,
      isLoading: false,
      error: null,
    }
  }),
}))

// Mock de Supabase
vi.mock('@/lib/supabase/client', () => ({
  default: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockUnifiedRecords, error: null }),
    })),
  },
}))

describe('useReportData Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe retornar datos correctamente', () => {
    const { result } = renderHook(() => useReportData('day', '2025-11-23'))

    expect(result.current).toBeDefined()
    expect(result.current.hasData).toBe(true)
    expect(result.current.rawData).toHaveLength(3)
  })

  it('debe calcular estadísticas básicas correctamente', () => {
    const { result } = renderHook(() => useReportData('day', '2025-11-23'))

    expect(result.current.stats.total).toBe(3)
    expect(result.current.stats.counter).toBe(2)
    expect(result.current.stats.siberia).toBe(1)
    expect(result.current.stats.signed).toBe(2)
  })

  it('debe calcular la tasa de firma correctamente', () => {
    const { result } = renderHook(() => useReportData('day', '2025-11-23'))

    // 2 firmados de 3 total = 67% (redondeado)
    expect(result.current.stats.signatureRate).toBe(67)
  })

  it('debe identificar la aerolínea principal', () => {
    const { result } = renderHook(() => useReportData('day', '2025-11-23'))

    expect(result.current.stats.topAirline).toBeDefined()
    expect(result.current.stats.topAirline?.name).toBe('LATAM')
    expect(result.current.stats.topAirline?.count).toBe(2)
  })

  it('debe identificar la categoría principal', () => {
    const { result } = renderHook(() => useReportData('day', '2025-11-23'))

    expect(result.current.stats.topCategory).toBeDefined()
    expect(result.current.stats.topCategory?.code).toBe('A')
    expect(result.current.stats.topCategory?.label).toBe('Asa rota')
    expect(result.current.stats.topCategory?.count).toBe(2)
  })

  it('debe calcular conteos por turno', () => {
    const { result } = renderHook(() => useReportData('day', '2025-11-23'))

    expect(result.current.stats.shiftCounts).toBeDefined()
    expect(result.current.stats.shiftCounts['BRC-ERC']).toBe(1)
    expect(result.current.stats.shiftCounts['IRC-KRC']).toBe(2)
  })

  it('debe identificar el turno dominante', () => {
    const { result } = renderHook(() => useReportData('day', '2025-11-23'))

    expect(result.current.stats.dominantShift).toBe('IRC-KRC')
  })

  it('debe agrupar datos por aerolínea', () => {
    const { result } = renderHook(() => useReportData('day', '2025-11-23'))

    expect(result.current.byAirline).toBeDefined()
    expect(result.current.byAirline.length).toBeGreaterThan(0)

    const latam = result.current.byAirline.find(a => a.name === 'LATAM')
    expect(latam?.value).toBe(2)
  })

  it('debe agrupar datos por categoría', () => {
    const { result } = renderHook(() => useReportData('day', '2025-11-23'))

    expect(result.current.byCategory).toBeDefined()
    expect(result.current.byCategory.length).toBeGreaterThan(0)

    const categoryA = result.current.byCategory.find(c => c.name === 'Categoría A')
    expect(categoryA?.value).toBe(2)
  })

  it('debe calcular top vuelos con más daños', () => {
    const { result } = renderHook(() => useReportData('day', '2025-11-23'))

    expect(result.current.topFlights).toBeDefined()
    expect(result.current.topFlights.length).toBeGreaterThan(0)
    expect(result.current.topFlights[0].flight).toBeDefined()
    expect(result.current.topFlights[0].damages).toBeGreaterThan(0)
  })

  it('debe calcular daños por turno y aerolínea', () => {
    const { result } = renderHook(() => useReportData('day', '2025-11-23'))

    expect(result.current.damagesByShiftAndAirline).toBeDefined()
    expect(result.current.damagesByShiftAndAirline).toHaveLength(2)

    const morningShift = result.current.damagesByShiftAndAirline[0]
    expect(morningShift.shift).toBe('BRC-ERC (Mañana)')

    const afternoonShift = result.current.damagesByShiftAndAirline[1]
    expect(afternoonShift.shift).toBe('IRC-KRC (Tarde)')
  })

  it('debe manejar diferentes tipos de período', () => {
    const { result: dayResult } = renderHook(() => useReportData('day', '2025-11-23'))
    expect(dayResult.current).toBeDefined()

    const { result: weekResult } = renderHook(() => useReportData('week', '2025-W47'))
    expect(weekResult.current).toBeDefined()

    const { result: monthResult } = renderHook(() => useReportData('month', '2025-11'))
    expect(monthResult.current).toBeDefined()

    const { result: yearResult } = renderHook(() => useReportData('year', '2025'))
    expect(yearResult.current).toBeDefined()
  })
})
