import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../login-form'
import { mockSupabaseClient, mockSession } from '@/test/mocks/supabase'

// Mock del módulo de Supabase
vi.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabaseClient,
}))

// Mock de react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe renderizar el formulario de login correctamente', () => {
    render(<LoginForm />)

    expect(screen.getByText('RegisDaños')).toBeInTheDocument()
    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('debe permitir ingresar email y contraseña', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('debe alternar la visibilidad de la contraseña', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const passwordInput = screen.getByLabelText(/contraseña/i)
    const toggleButton = screen.getByRole('button', { name: '' }) // Botón de toggle sin texto

    // Inicialmente debe ser tipo password
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Click para mostrar
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    // Click para ocultar
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('debe manejar login exitoso', async () => {
    const user = userEvent.setup()

    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('debe mostrar error cuando las credenciales son incorrectas', async () => {
    const user = userEvent.setup()

    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: { session: null },
      error: { message: 'Invalid login credentials' },
    })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
    })
  })

  it('debe mostrar estado de carga durante el login', async () => {
    const user = userEvent.setup()

    // Simular una promesa que tarda en resolverse
    mockSupabaseClient.auth.signInWithPassword.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { session: mockSession }, error: null }), 100))
    )

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Verificar que muestra el estado de carga
    expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Esperar a que termine
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('debe deshabilitar los inputs durante el login', async () => {
    const user = userEvent.setup()

    mockSupabaseClient.auth.signInWithPassword.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { session: mockSession }, error: null }), 100))
    )

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Verificar que los inputs están deshabilitados
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
  })
})
