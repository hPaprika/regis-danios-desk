import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn utility function', () => {
  it('debe combinar clases correctamente', () => {
    const result = cn('class1', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('debe manejar clases condicionales', () => {
    const result = cn('base', true && 'conditional', false && 'hidden')
    expect(result).toBe('base conditional')
  })

  it('debe fusionar clases de Tailwind conflictivas', () => {
    // twMerge debe resolver conflictos de Tailwind
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toBe('py-1 px-4')
  })

  it('debe manejar arrays de clases', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('debe ignorar valores falsy', () => {
    const result = cn('class1', null, undefined, false, '', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('debe manejar objetos de clases', () => {
    const result = cn({
      'class1': true,
      'class2': false,
      'class3': true,
    })
    expect(result).toBe('class1 class3')
  })
})
