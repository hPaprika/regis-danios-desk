import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { Input } from '../input'

describe('Input Component', () => {
  it('debe renderizar correctamente', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument()
  })

  it('debe manejar cambios de valor', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Input onChange={handleChange} />)
    const input = screen.getByRole('textbox')

    await user.type(input, 'test')
    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('test')
  })

  it('debe aplicar diferentes tipos de input', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" />)
    const passwordInput = document.querySelector('input[type="password"]')
    expect(passwordInput).toBeInTheDocument()

    rerender(<Input type="number" />)
    const numberInput = document.querySelector('input[type="number"]')
    expect(numberInput).toBeInTheDocument()
  })

  it('debe estar deshabilitado cuando disabled es true', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')

    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:opacity-50')
  })

  it('debe aplicar clases personalizadas', () => {
    render(<Input className="custom-input" />)
    const input = screen.getByRole('textbox')

    expect(input).toHaveClass('custom-input')
  })

  it('debe tener el atributo data-slot', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')

    expect(input).toHaveAttribute('data-slot', 'input')
  })

  it('debe manejar el atributo required', () => {
    render(<Input required />)
    const input = screen.getByRole('textbox')

    expect(input).toBeRequired()
  })

  it('debe manejar valores controlados', async () => {
    const user = userEvent.setup()
    const TestComponent = () => {
      const [value, setValue] = React.useState('')
      return (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          data-testid="controlled-input"
        />
      )
    }

    render(<TestComponent />)
    const input = screen.getByTestId('controlled-input')

    await user.type(input, 'controlled')
    expect(input).toHaveValue('controlled')
  })
})
