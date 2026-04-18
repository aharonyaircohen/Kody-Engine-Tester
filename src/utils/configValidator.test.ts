import { describe, it, expect } from 'vitest'
import {
  ValidationError,
  validateConfig,
  string,
  number,
  boolean,
  array,
  optional,
  arrayOf,
} from './configValidator'

describe('ValidationError', () => {
  it('stores field and message', () => {
    const e = new ValidationError('name', 'must be a string')
    expect(e.field).toBe('name')
    expect(e.message).toBe('must be a string')
  })
})

describe('validateConfig', () => {
  it('returns ok with validated fields when all fields pass', () => {
    const schema = { name: string, age: number }
    const result = validateConfig(schema, { name: 'Alice', age: 30 })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toEqual({ name: 'Alice', age: 30 })
    }
  })

  it('returns ok for an empty schema with an empty object', () => {
    const result = validateConfig({}, {})
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toEqual({})
    }
  })

  it('collects all errors rather than failing on the first', () => {
    const schema = { name: string, age: number, active: boolean }
    const result = validateConfig(schema, { name: 42, age: 'old', active: 'yes' })
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toHaveLength(3)
      expect(result.error.map((e) => e.field)).toEqual(['name', 'age', 'active'])
    }
  })

  it('returns err when data is not an object', () => {
    const result = validateConfig({ name: string }, 'not an object')
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toHaveLength(1)
      expect(result.error[0].field).toBe('(root)')
      expect(result.error[0].message).toContain('Expected object')
    }
  })

  it('returns err when data is an array', () => {
    const result = validateConfig({ name: string }, ['Alice'])
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error[0].field).toBe('(root)')
      expect(result.error[0].message).toContain('Expected object')
    }
  })

  it('returns err when data is null', () => {
    const result = validateConfig({ name: string }, null)
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error[0].field).toBe('(root)')
      expect(result.error[0].message).toContain('null')
    }
  })

  it('skips validation for missing fields when no default value is provided', () => {
    const result = validateConfig({ name: string }, {})
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error).toHaveLength(1)
      expect(result.error[0].field).toBe('name')
    }
  })

  it('reports unexpected extra fields in the data object', () => {
    const schema = { name: string }
    // Extra fields are silently ignored (not treated as errors)
    const result = validateConfig(schema, { name: 'Bob', extra: 123 })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toEqual({ name: 'Bob' })
    }
  })

  describe('string validator', () => {
    it('returns ok for a string', () => {
      const result = string('hello', 'name')
      expect(result.isOk()).toBe(true)
      if (result.isOk()) expect(result.value).toBe('hello')
    })

    it('returns ok for an empty string', () => {
      const result = string('', 'name')
      expect(result.isOk()).toBe(true)
    })

    it('returns err for a number', () => {
      const result = string(42, 'name')
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.field).toBe('name')
        expect(result.error.message).toContain('Expected string')
      }
    })

    it('returns err for null', () => {
      const result = string(null, 'name')
      expect(result.isErr()).toBe(true)
    })
  })

  describe('number validator', () => {
    it('returns ok for a finite number', () => {
      const result = number(42, 'age')
      expect(result.isOk()).toBe(true)
      if (result.isOk()) expect(result.value).toBe(42)
    })

    it('returns ok for zero', () => {
      const result = number(0, 'age')
      expect(result.isOk()).toBe(true)
    })

    it('returns ok for negative numbers', () => {
      const result = number(-3.14, 'temp')
      expect(result.isOk()).toBe(true)
    })

    it('returns err for a string', () => {
      const result = number('42', 'age')
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('Expected number')
      }
    })

    it('returns err for NaN', () => {
      const result = number(NaN, 'age')
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('NaN')
      }
    })
  })

  describe('boolean validator', () => {
    it('returns ok for true', () => {
      const result = boolean(true, 'active')
      expect(result.isOk()).toBe(true)
    })

    it('returns ok for false', () => {
      const result = boolean(false, 'active')
      expect(result.isOk()).toBe(true)
    })

    it('returns err for a string', () => {
      const result = boolean('true', 'active')
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.message).toContain('Expected boolean')
      }
    })

    it('returns err for the number 1', () => {
      const result = boolean(1, 'active')
      expect(result.isErr()).toBe(true)
    })
  })

  describe('array validator', () => {
    it('returns ok for an array', () => {
      const result = array([1, 2, 3], 'tags')
      expect(result.isOk()).toBe(true)
    })

    it('returns ok for an empty array', () => {
      const result = array([], 'tags')
      expect(result.isOk()).toBe(true)
    })

    it('returns err for a non-array', () => {
      const result = array({ length: 0 }, 'tags')
      expect(result.isErr()).toBe(true)
    })
  })

  describe('optional', () => {
    it('returns ok for undefined', () => {
      const result = optional(string)(undefined, 'nickname')
      expect(result.isOk()).toBe(true)
      if (result.isOk()) expect(result.value).toBeUndefined()
    })

    it('returns ok for null', () => {
      const result = optional(string)(null, 'nickname')
      expect(result.isOk()).toBe(true)
      if (result.isOk()) expect(result.value).toBeUndefined()
    })

    it('returns ok with the validated value when present', () => {
      const result = optional(string)('hello', 'nickname')
      expect(result.isOk()).toBe(true)
      if (result.isOk()) expect(result.value).toBe('hello')
    })

    it('returns err for a wrong type when value is present', () => {
      const result = optional(string)(42, 'nickname')
      expect(result.isErr()).toBe(true)
    })

    it('allows optional field to be missing from config', () => {
      const schema = { name: string, nickname: optional(string) }
      const result = validateConfig(schema, { name: 'Alice' })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toEqual({ name: 'Alice', nickname: undefined })
      }
    })
  })

  describe('arrayOf', () => {
    it('returns ok for a homogeneous array', () => {
      const result = arrayOf(string)(['a', 'b'], 'tags')
      expect(result.isOk()).toBe(true)
      if (result.isOk()) expect(result.value).toEqual(['a', 'b'])
    })

    it('returns ok for an empty array', () => {
      const result = arrayOf(string)([], 'tags')
      expect(result.isOk()).toBe(true)
    })

    it('returns err for non-array', () => {
      const result = arrayOf(string)('abc', 'tags')
      expect(result.isErr()).toBe(true)
    })

    it('returns err and includes index in field path for invalid items', () => {
      const result = arrayOf(number)([1, 'two', 3], 'scores')
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0].field).toBe('scores[1]')
        expect(result.error[0].message).toContain('Expected number')
        expect(result.error).toHaveLength(1)
      }
    })

    it('returns err with multiple item errors', () => {
      const result = arrayOf(string)([1, 2], 'tags')
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toHaveLength(2)
        expect(result.error[0].field).toBe('tags[0]')
        expect(result.error[1].field).toBe('tags[1]')
      }
    })
  })

  describe('Result integration', () => {
    it('supports .map on ok result', () => {
      const schema = { name: string }
      const result = validateConfig(schema, { name: 'Alice' }).map((v) => ({
        ...v,
        greeting: `Hello, ${v.name}`,
      }))
      expect(result.isOk()).toBe(true)
      if (result.isOk()) expect(result.value.greeting).toBe('Hello, Alice')
    })

    it('supports .mapErr on err result', () => {
      const schema = { name: string }
      const result = validateConfig(schema, { name: 42 }).mapErr((errors) =>
        errors.map((e) => `[${e.field}] ${e.message}`),
      )
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error[0]).toBe('[name] Expected string but received number')
      }
    })

    it('supports .match', () => {
      const schema = { active: boolean }
      const outcome = validateConfig(schema, { active: true }).match({
        ok: (v) => `active = ${v.active}`,
        err: (e) => `errors: ${e.length}`,
      })
      expect(outcome).toBe('active = true')
    })
  })
})
