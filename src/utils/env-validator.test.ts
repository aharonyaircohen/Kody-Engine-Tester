import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { validateEnv, requireEnv, optionalEnv } from './env-validator'

describe('validateEnv', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns ok when all required variables are present', () => {
    process.env.DATABASE_URL = 'postgres://localhost:5432/db'
    process.env.PAYLOAD_SECRET = 'my-secret-key'

    const result = validateEnv(['DATABASE_URL', 'PAYLOAD_SECRET'])

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.present).toContain('DATABASE_URL')
      expect(result.value.present).toContain('PAYLOAD_SECRET')
      expect(result.value.missing).toHaveLength(0)
    }
  })

  it('returns err when required variable is missing', () => {
    process.env.DATABASE_URL = 'postgres://localhost:5432/db'
    delete process.env.PAYLOAD_SECRET

    const result = validateEnv(['DATABASE_URL', 'PAYLOAD_SECRET'])

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.message).toContain('PAYLOAD_SECRET')
      expect(result.error.message).toContain('Missing required environment variables')
    }
  })

  it('returns err when all required variables are missing', () => {
    const result = validateEnv(['NONEXISTENT_VAR_1', 'NONEXISTENT_VAR_2'])

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.message).toContain('NONEXISTENT_VAR_1')
      expect(result.error.message).toContain('NONEXISTENT_VAR_2')
    }
  })

  it('returns err when required array is empty', () => {
    const result = validateEnv([])

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.present).toHaveLength(0)
      expect(result.value.missing).toHaveLength(0)
    }
  })

  it('returns err when required is not an array', () => {
    const result = validateEnv('DATABASE_URL' as unknown as string[])

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.message).toBe('required must be an array of environment variable names')
    }
  })

  it('returns err when a variable name is empty string', () => {
    const result = validateEnv([''])

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.message).toBe('each required variable name must be a non-empty string')
    }
  })

  it('returns err when a variable name is only whitespace', () => {
    const result = validateEnv(['  '])

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.message).toBe('each required variable name must be a non-empty string')
    }
  })

  it('treats empty string variable value as missing', () => {
    process.env.DATABASE_URL = ''

    const result = validateEnv(['DATABASE_URL'])

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.message).toContain('DATABASE_URL')
    }
  })
})

describe('requireEnv', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns the value when variable is present', () => {
    process.env.MY_VAR = 'my-value'

    expect(requireEnv('MY_VAR')).toBe('my-value')
  })

  it('throws when variable is not set', () => {
    expect(() => requireEnv('NONEXISTENT_VAR')).toThrow(
      'Required environment variable NONEXISTENT_VAR is not set'
    )
  })

  it('throws when variable is set to empty string', () => {
    process.env.EMPTY_VAR = ''

    expect(() => requireEnv('EMPTY_VAR')).toThrow(
      'Required environment variable EMPTY_VAR is not set'
    )
  })
})

describe('optionalEnv', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns the value when variable is present', () => {
    process.env.OPT_VAR = 'opt-value'

    expect(optionalEnv('OPT_VAR', 'default')).toBe('opt-value')
  })

  it('returns default value when variable is not set', () => {
    expect(optionalEnv('NONEXISTENT_VAR', 'default-value')).toBe('default-value')
  })

  it('returns default value when variable is empty string', () => {
    process.env.EMPTY_OPT = ''

    expect(optionalEnv('EMPTY_OPT', 'default-value')).toBe('default-value')
  })

  it('returns default value of different types', () => {
    expect(optionalEnv('MISSING', '42')).toBe('42')
    expect(optionalEnv('MISSING', 'false')).toBe('false')
  })
})
