import { describe, it, expect } from 'vitest'
import { validateConfig } from './configValidator'
import type { ValidationError } from './configValidator'
import type { Err } from './result'

describe('validateConfig', () => {
  describe('required fields', () => {
    it('returns Ok for a valid config with only required fields', () => {
      const result = validateConfig({ description: 'My task' })
      expect(result.isOk()).toBe(true)
      expect(result.unwrap()).toMatchObject({ description: 'My task' })
    })

    it('returns Err when config is not an object', () => {
      const result = validateConfig('not an object')
      expect(result.isErr()).toBe(true)
      const errors = (result as Err<unknown, ValidationError[]>).error
      expect(errors).toHaveLength(1)
      expect(errors[0].field).toBe('root')
    })

    it('returns Err when config is null', () => {
      const result = validateConfig(null)
      expect(result.isErr()).toBe(true)
    })

    it('returns Err when description is missing', () => {
      const result = validateConfig({})
      expect(result.isErr()).toBe(true)
      const errors = (result as Err<unknown, ValidationError[]>).error
      expect(errors.some((e) => e.field === 'description')).toBe(true)
    })

    it('returns Err when description is an empty string', () => {
      const result = validateConfig({ description: '   ' })
      expect(result.isErr()).toBe(true)
      const errors = (result as Err<unknown, ValidationError[]>).error
      expect(errors.some((e) => e.field === 'description')).toBe(true)
    })

    it('returns Err when description is not a string', () => {
      const result = validateConfig({ description: 42 })
      expect(result.isErr()).toBe(true)
      const errors = (result as Err<unknown, ValidationError[]>).error
      expect(errors.some((e) => e.field === 'description')).toBe(true)
    })
  })

  describe('type constraints', () => {
    it('accepts valid optional boolean fields', () => {
      const result = validateConfig({
        description: 'My task',
        noCompose: false,
        compose: false,
        composeAll: false,
      })
      expect(result.isOk()).toBe(true)
    })

    it('returns Err when noCompose is not a boolean', () => {
      const result = validateConfig({ description: 'My task', noCompose: 'yes' })
      expect(result.isErr()).toBe(true)
      const errors = (result as Err<unknown, ValidationError[]>).error
      expect(errors.some((e) => e.field === 'noCompose')).toBe(true)
    })

    it('returns Err when compose is not a boolean', () => {
      const result = validateConfig({ description: 'My task', compose: 1 })
      expect(result.isErr()).toBe(true)
      const errors = (result as Err<unknown, ValidationError[]>).error
      expect(errors.some((e) => e.field === 'compose')).toBe(true)
    })

    it('returns Err when composeAll is not a boolean', () => {
      const result = validateConfig({ description: 'My task', composeAll: 'all' })
      expect(result.isErr()).toBe(true)
      const errors = (result as Err<unknown, ValidationError[]>).error
      expect(errors.some((e) => e.field === 'composeAll')).toBe(true)
    })

    it('returns Err when buildTargets is not an array', () => {
      const result = validateConfig({ description: 'My task', buildTargets: 'src' })
      expect(result.isErr()).toBe(true)
      const errors = (result as Err<unknown, ValidationError[]>).error
      expect(errors.some((e) => e.field === 'buildTargets')).toBe(true)
    })

    it('accepts a valid buildTargets array', () => {
      const result = validateConfig({ description: 'My task', buildTargets: ['src', 'dist'] })
      expect(result.isOk()).toBe(true)
    })

    it('returns Err when entryPoint is not a string', () => {
      const result = validateConfig({ description: 'My task', entryPoint: 99 })
      expect(result.isErr()).toBe(true)
      const errors = (result as Err<unknown, ValidationError[]>).error
      expect(errors.some((e) => e.field === 'entryPoint')).toBe(true)
    })

    it('accepts a valid entryPoint string', () => {
      const result = validateConfig({ description: 'My task', entryPoint: 'src/index.ts' })
      expect(result.isOk()).toBe(true)
    })
  })

  describe('--no-compose mutual exclusivity', () => {
    it('returns Err when noCompose and compose are both true', () => {
      const result = validateConfig({ description: 'My task', noCompose: true, compose: true })
      expect(result.isErr()).toBe(true)
      const errors = (result as Err<unknown, ValidationError[]>).error
      expect(errors.some((e) => e.field === 'noCompose')).toBe(true)
    })

    it('returns Err when noCompose and composeAll are both true', () => {
      const result = validateConfig({ description: 'My task', noCompose: true, composeAll: true })
      expect(result.isErr()).toBe(true)
      const errors = (result as Err<unknown, ValidationError[]>).error
      expect(errors.some((e) => e.field === 'noCompose')).toBe(true)
    })

    it('allows noCompose: true when compose and composeAll are absent', () => {
      const result = validateConfig({ description: 'My task', noCompose: true })
      expect(result.isOk()).toBe(true)
    })

    it('allows noCompose: true when compose and composeAll are false', () => {
      const result = validateConfig({
        description: 'My task',
        noCompose: true,
        compose: false,
        composeAll: false,
      })
      expect(result.isOk()).toBe(true)
    })

    it('allows compose: true without noCompose', () => {
      const result = validateConfig({ description: 'My task', compose: true })
      expect(result.isOk()).toBe(true)
    })

    it('allows composeAll: true without noCompose', () => {
      const result = validateConfig({ description: 'My task', composeAll: true })
      expect(result.isOk()).toBe(true)
    })
  })

  describe('multiple validation errors', () => {
    it('collects all errors when multiple fields are invalid', () => {
      const result = validateConfig({ description: '', noCompose: 'yes', buildTargets: 'src' })
      expect(result.isErr()).toBe(true)
      const errors = (result as Err<unknown, ValidationError[]>).error
      expect(errors.length).toBeGreaterThanOrEqual(3)
    })
  })
})
