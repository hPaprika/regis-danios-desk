import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from '../AuthContext'
import { mockSupabaseClient, mockSession } from '@/test/mocks/supabase'

// Mock de Supabase
vi.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabaseClient,
}))

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AuthProvider', () => {
    it('debe inicializar con loading true', () => {
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      })

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.loading).toBe(true)
    })

    it('debe cargar la sesión al montar', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      })

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.session).toBeDefined()
      expect(result.current.user).toBeDefined()
      expect(result.current.user?.email).toBe('test@example.com')
    })

    it('debe manejar sesión nula correctamente', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      })

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.session).toBeNull()
      expect(result.current.user).toBeNull()
    })

    it('debe configurar el listener de cambios de autenticación', () => {
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      })

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )

      renderHook(() => useAuth(), { wrapper })

      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled()
    })
  })

  describe('useAuth Hook', () => {
    it('debe lanzar error cuando se usa fuera del AuthProvider', () => {
      // Suprimir console.error para esta prueba
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth debe usarse dentro de un AuthProvider')

      consoleSpy.mockRestore()
    })

    it('debe retornar el contexto cuando se usa dentro del AuthProvider', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      })

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current).toHaveProperty('session')
      expect(result.current).toHaveProperty('user')
      expect(result.current).toHaveProperty('loading')
    })
  })
})
