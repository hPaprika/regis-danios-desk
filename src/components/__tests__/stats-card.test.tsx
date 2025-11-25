import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { Package, TrendingUp, TrendingDown } from 'lucide-react'
import { StatsCard } from '../stats-card'

describe('StatsCard Component', () => {
  it('debe renderizar correctamente con props básicas', () => {
    render(
      <StatsCard
        title="Total Daños"
        value={150}
        icon={Package}
      />
    )

    expect(screen.getByText('Total Daños')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('debe renderizar el subtítulo cuando se proporciona', () => {
    render(
      <StatsCard
        title="Total Daños"
        value={150}
        subtitle="Esta semana"
        icon={Package}
      />
    )

    expect(screen.getByText('Esta semana')).toBeInTheDocument()
  })

  it('debe renderizar la descripción cuando se proporciona', () => {
    render(
      <StatsCard
        title="Total Daños"
        value={150}
        description="Incluye counter y siberia"
        icon={Package}
      />
    )

    expect(screen.getByText('Incluye counter y siberia')).toBeInTheDocument()
  })

  it('debe renderizar tendencia positiva correctamente', () => {
    render(
      <StatsCard
        title="Total Daños"
        value={150}
        icon={Package}
        trend={{ value: 12, isPositive: true }}
      />
    )

    expect(screen.getByText('12%')).toBeInTheDocument()
    const trendElement = screen.getByText('12%')
    expect(trendElement).toHaveClass('text-success')
  })

  it('debe renderizar tendencia negativa correctamente', () => {
    render(
      <StatsCard
        title="Total Daños"
        value={150}
        icon={Package}
        trend={{ value: 8, isPositive: false }}
      />
    )

    expect(screen.getByText('8%')).toBeInTheDocument()
    const trendElement = screen.getByText('8%')
    expect(trendElement).toHaveClass('text-destructive')
  })

  it('debe aceptar valores de tipo string', () => {
    render(
      <StatsCard
        title="Aerolínea Principal"
        value="LATAM"
        icon={Package}
      />
    )

    expect(screen.getByText('LATAM')).toBeInTheDocument()
  })

  it('debe aplicar clases personalizadas', () => {
    render(
      <StatsCard
        title="Total"
        value={100}
        icon={Package}
        className="custom-stats-card"
        data-testid="stats-card"
      />
    )

    const card = screen.getByTestId('stats-card')
    expect(card).toHaveClass('custom-stats-card')
  })

  it('debe renderizar todos los elementos juntos', () => {
    render(
      <StatsCard
        title="Total Daños"
        value={150}
        subtitle="Esta semana"
        description="Incluye todas las fuentes"
        icon={Package}
        trend={{ value: 15, isPositive: true }}
      />
    )

    expect(screen.getByText('Total Daños')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
    expect(screen.getByText('Esta semana')).toBeInTheDocument()
    expect(screen.getByText('Incluye todas las fuentes')).toBeInTheDocument()
    expect(screen.getByText('15%')).toBeInTheDocument()
  })
})
