import { describe, it, expect } from 'vitest'
import { s, SchemaError, type infer as Infer } from './schema'

describe('s.string()', () => {
  it('parses valid strings', () => {
    expect(s.string().parse('hello')).toBe('hello')
    expect(s.string().parse('')).toBe('')
  })

  it('throws for non-strings', () => {
    expect(() => s.string().parse(42)).toThrow(SchemaError)
    expect(() => s.string().parse(42)).toThrow('Expected string but received number')
    expect(() => s.string().parse(true)).toThrow('Expected string but received boolean')
    expect(() => s.string().parse({})).toThrow('Expected string but received object')
  })

  it('throws for null/undefined without optional', () => {
    expect(() => s.string().parse(null)).toThrow(SchemaError)
    expect(() => s.string().parse(undefined)).toThrow(SchemaError)
  })
})

describe('s.number()', () => {
  it('parses valid numbers', () => {
    expect(s.number().parse(42)).toBe(42)
    expect(s.number().parse(0)).toBe(0)
    expect(s.number().parse(-3.14)).toBe(-3.14)
  })

  it('throws for non-numbers', () => {
    expect(() => s.number().parse('42')).toThrow(SchemaError)
    expect(() => s.number().parse('42')).toThrow('Expected number but received string')
    expect(() => s.number().parse(true)).toThrow('Expected number but received boolean')
  })

  it('throws for NaN', () => {
    expect(() => s.number().parse(NaN)).toThrow(SchemaError)
  })
})

describe('s.boolean()', () => {
  it('parses valid booleans', () => {
    expect(s.boolean().parse(true)).toBe(true)
    expect(s.boolean().parse(false)).toBe(false)
  })

  it('throws for non-booleans', () => {
    expect(() => s.boolean().parse(1)).toThrow(SchemaError)
    expect(() => s.boolean().parse(1)).toThrow('Expected boolean but received number')
    expect(() => s.boolean().parse('true')).toThrow('Expected boolean but received string')
  })
})

describe('s.array()', () => {
  it('parses valid arrays', () => {
    expect(s.array(s.string()).parse(['a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
    expect(s.array(s.number()).parse([1, 2, 3])).toEqual([1, 2, 3])
    expect(s.array(s.string()).parse([])).toEqual([])
  })

  it('throws for non-arrays', () => {
    expect(() => s.array(s.string()).parse('not an array')).toThrow(SchemaError)
    expect(() => s.array(s.string()).parse('not an array')).toThrow('Expected array but received string')
    expect(() => s.array(s.string()).parse({})).toThrow('Expected array but received object')
  })

  it('throws with index for invalid items', () => {
    expect(() => s.array(s.number()).parse([1, 'two', 3])).toThrow('At index 1')
    expect(() => s.array(s.number()).parse([1, 'two', 3])).toThrow('Expected number but received string')
  })

  it('parses nested arrays', () => {
    const schema = s.array(s.array(s.number()))
    expect(schema.parse([[1, 2], [3, 4]])).toEqual([[1, 2], [3, 4]])
  })
})

describe('s.object()', () => {
  it('parses valid objects', () => {
    const schema = s.object({ name: s.string(), age: s.number() })
    expect(schema.parse({ name: 'Alice', age: 30 })).toEqual({ name: 'Alice', age: 30 })
  })

  it('throws for non-objects', () => {
    const schema = s.object({ name: s.string() })
    expect(() => schema.parse('not an object')).toThrow(SchemaError)
    expect(() => schema.parse('not an object')).toThrow('Expected object but received string')
    expect(() => schema.parse([])).toThrow('Expected object but received array')
    expect(() => schema.parse(null)).toThrow(SchemaError)
  })

  it('throws with key name for invalid fields', () => {
    const schema = s.object({ age: s.number() })
    expect(() => schema.parse({ age: 'not a number' })).toThrow('At key "age"')
    expect(() => schema.parse({ age: 'not a number' })).toThrow('Expected number but received string')
  })

  it('parses nested objects', () => {
    const schema = s.object({
      user: s.object({ name: s.string(), active: s.boolean() }),
      scores: s.array(s.number()),
    })
    const result = schema.parse({ user: { name: 'Bob', active: true }, scores: [10, 20] })
    expect(result).toEqual({ user: { name: 'Bob', active: true }, scores: [10, 20] })
  })
})

describe('.optional() modifier', () => {
  it('allows undefined values', () => {
    expect(s.string().optional().parse(undefined)).toBeUndefined()
    expect(s.string().optional().parse(null)).toBeUndefined()
  })

  it('still validates non-undefined values', () => {
    expect(s.string().optional().parse('hello')).toBe('hello')
    expect(() => s.string().optional().parse(42)).toThrow(SchemaError)
  })

  it('works on object fields', () => {
    const schema = s.object({ name: s.string(), nickname: s.string().optional() })
    expect(schema.parse({ name: 'Alice', nickname: undefined })).toEqual({ name: 'Alice', nickname: undefined })
    expect(schema.parse({ name: 'Alice' })).toEqual({ name: 'Alice', nickname: undefined })
  })
})

describe('.default() modifier', () => {
  it('returns default for undefined', () => {
    expect(s.string().default('fallback').parse(undefined)).toBe('fallback')
    expect(s.string().default('fallback').parse(null)).toBe('fallback')
  })

  it('returns parsed value when provided', () => {
    expect(s.string().default('fallback').parse('hello')).toBe('hello')
  })

  it('works with numbers', () => {
    expect(s.number().default(0).parse(undefined)).toBe(0)
    expect(s.number().default(0).parse(42)).toBe(42)
  })

  it('works with arrays', () => {
    const schema = s.array(s.string()).default([])
    expect(schema.parse(undefined)).toEqual([])
    expect(schema.parse(['a'])).toEqual(['a'])
  })

  it('still validates when value is provided', () => {
    expect(() => s.string().default('x').parse(42)).toThrow(SchemaError)
  })
})

describe('s.infer type extraction', () => {
  it('extracts correct types at compile time', () => {
    const userSchema = s.object({
      name: s.string(),
      age: s.number(),
      active: s.boolean(),
      tags: s.array(s.string()),
      nickname: s.string().optional(),
    })

    type User = Infer<typeof userSchema>

    // Runtime check using the schema
    const user: User = userSchema.parse({
      name: 'Alice',
      age: 30,
      active: true,
      tags: ['admin'],
      nickname: undefined,
    })

    expect(user.name).toBe('Alice')
    expect(user.age).toBe(30)
    expect(user.active).toBe(true)
    expect(user.tags).toEqual(['admin'])
    expect(user.nickname).toBeUndefined()
  })
})

describe('error messages', () => {
  it('provides clear messages for each type mismatch', () => {
    expect(() => s.string().parse(123)).toThrow('Expected string but received number')
    expect(() => s.number().parse('x')).toThrow('Expected number but received string')
    expect(() => s.boolean().parse(0)).toThrow('Expected boolean but received number')
    expect(() => s.array(s.string()).parse({})).toThrow('Expected array but received object')
    expect(() => s.object({}).parse([])).toThrow('Expected object but received array')
  })

  it('includes path info for nested errors', () => {
    const schema = s.object({ user: s.object({ age: s.number() }) })
    expect(() => schema.parse({ user: { age: 'old' } })).toThrow('At key "user"')

    const arrSchema = s.array(s.boolean())
    expect(() => arrSchema.parse([true, 'yes'])).toThrow('At index 1')
  })
})
