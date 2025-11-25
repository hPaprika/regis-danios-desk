import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { DashboardPage } from '../dashboard-page'
import { mockUnifiedRecords } from '@/test/mocks/supabase'

// Mock de SWR
vi.mock('swr', () => ({
  default: vi.fn(() => ({
    data: mockUnifiedRecords,
    isLoading: false,
    error: null,
  })),
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
    rpc: vi.fn(),
  },
}))

describe('DashboardPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe renderizar el título de la página', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('debe mostrar los botones de modo de vista', () => {
    render(<DashboardPage />)

    expect(screen.getByRole('button', { name: /hoy/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /últimos 7 días/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mes/i })).toBeInTheDocument()
  })

  it('debe mostrar las tarjetas de estadísticas cuando hay datos', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/total daños/i)).toBeInTheDocument()
    })
  })

  it('debe mostrar estado de carga inicialmente', () => {
    // Mock para simular loading
    vi.mock('swr', () => ({
      default: vi.fn(() => ({
        data: undefined,
        isLoading: true,
        error: null,
      })),
    }))

    render(<DashboardPage />)

    // Verificar que hay elementos de carga (skeleton)
    const cards = document.querySelectorAll('.animate-pulse')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('debe permitir cambiar entre modos de vista', async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)

    const todayButton = screen.getByRole('button', { name: /hoy/i })
    const last7DaysButton = screen.getByRole('button', { name: /últimos 7 días/i })

    // Inicialmente debe estar en modo "Hoy"
    expect(todayButton).toHaveClass('bg-primary')

    // Cambiar a "Últimos 7 días"
    await user.click(last7DaysButton)

    await waitFor(() => {
      expect(last7DaysButton).toHaveClass('bg-primary')
    })
  })
})
