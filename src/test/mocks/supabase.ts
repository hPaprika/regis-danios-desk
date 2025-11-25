import { vi } from 'vitest'

/**
 * Mock del cliente de Supabase para pruebas
 */
export const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
}

/**
 * Datos de prueba para registros unificados
 */
export const mockUnifiedRecords = [
  {
    id: '1',
    source: 'counter' as const,
    codigo: 'ABC123',
    aerolinea: 'LATAM',
    vuelo: 'LA800',
    categorias: ['A', 'B'],
    observacion: 'Maleta dañada en asa',
    fecha_hora: '2025-11-23T10:00:00Z',
    usuario: 'Juan Pérez',
    turno: 'BRC-ERC',
    firma: true,
    imagen_url: 'https://example.com/image1.jpg',
    created_at: '2025-11-23T10:00:00Z',
    updated_at: '2025-11-23T10:00:00Z',
  },
  {
    id: '2',
    source: 'siberia' as const,
    codigo: 'DEF456',
    aerolinea: 'SKY',
    vuelo: 'H2500',
    categorias: ['C'],
    observacion: 'Rueda rota',
    fecha_hora: '2025-11-23T14:00:00Z',
    usuario: 'María García',
    turno: 'IRC-KRC',
    firma: false,
    imagen_url: 'https://example.com/image2.jpg',
    created_at: '2025-11-23T14:00:00Z',
    updated_at: '2025-11-23T14:00:00Z',
  },
  {
    id: '3',
    source: 'counter' as const,
    codigo: 'GHI789',
    aerolinea: 'LATAM',
    vuelo: 'LA801',
    categorias: ['A'],
    observacion: 'Asa completamente rota',
    fecha_hora: '2025-11-23T16:00:00Z',
    usuario: 'Pedro López',
    turno: 'IRC-KRC',
    firma: true,
    imagen_url: 'https://example.com/image3.jpg',
    created_at: '2025-11-23T16:00:00Z',
    updated_at: '2025-11-23T16:00:00Z',
  },
]

/**
 * Mock de sesión de usuario autenticado
 */
export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'user-123',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
}
