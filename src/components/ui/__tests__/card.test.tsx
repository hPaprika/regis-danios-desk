import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '../card'

describe('Card Components', () => {
  describe('Card', () => {
    it('debe renderizar correctamente', () => {
      render(<Card data-testid="card">Card Content</Card>)
      expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('debe aplicar clases por defecto', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')

      expect(card).toHaveClass('bg-card')
      expect(card).toHaveClass('rounded-xl')
      expect(card).toHaveClass('border')
    })

    it('debe aplicar clases personalizadas', () => {
      render(<Card className="custom-card" data-testid="card">Content</Card>)
      expect(screen.getByTestId('card')).toHaveClass('custom-card')
    })

    it('debe tener el atributo data-slot', () => {
      render(<Card data-testid="card">Content</Card>)
      expect(screen.getByTestId('card')).toHaveAttribute('data-slot', 'card')
    })
  })

  describe('CardHeader', () => {
    it('debe renderizar correctamente', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>)
      expect(screen.getByTestId('header')).toBeInTheDocument()
    })

    it('debe tener el atributo data-slot', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>)
      expect(screen.getByTestId('header')).toHaveAttribute('data-slot', 'card-header')
    })
  })

  describe('CardTitle', () => {
    it('debe renderizar correctamente', () => {
      render(<CardTitle>Title</CardTitle>)
      expect(screen.getByText('Title')).toBeInTheDocument()
    })

    it('debe aplicar estilos de título', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>)
      const title = screen.getByTestId('title')

      expect(title).toHaveClass('font-semibold')
      expect(title).toHaveAttribute('data-slot', 'card-title')
    })
  })

  describe('CardDescription', () => {
    it('debe renderizar correctamente', () => {
      render(<CardDescription>Description text</CardDescription>)
      expect(screen.getByText('Description text')).toBeInTheDocument()
    })

    it('debe aplicar estilos de descripción', () => {
      render(<CardDescription data-testid="desc">Description</CardDescription>)
      const desc = screen.getByTestId('desc')

      expect(desc).toHaveClass('text-muted-foreground')
      expect(desc).toHaveClass('text-sm')
    })
  })

  describe('CardContent', () => {
    it('debe renderizar correctamente', () => {
      render(<CardContent data-testid="content">Content</CardContent>)
      expect(screen.getByTestId('content')).toBeInTheDocument()
    })

    it('debe tener padding horizontal', () => {
      render(<CardContent data-testid="content">Content</CardContent>)
      expect(screen.getByTestId('content')).toHaveClass('px-6')
    })
  })

  describe('CardFooter', () => {
    it('debe renderizar correctamente', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>)
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('debe ser un contenedor flex', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>)
      const footer = screen.getByTestId('footer')

      expect(footer).toHaveClass('flex')
      expect(footer).toHaveClass('items-center')
    })
  })

  describe('Card completa', () => {
    it('debe renderizar todos los subcomponentes juntos', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>Test Content</CardContent>
          <CardFooter>Test Footer</CardFooter>
        </Card>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
      expect(screen.getByText('Test Footer')).toBeInTheDocument()
    })
  })
})
