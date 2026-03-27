import { describe, it, expect } from 'vitest'
import { validateForm } from './validateForm'
import { required, minLength, email, min } from './validators'

describe('validateForm', () => {
  it('returns valid: true and empty errors when all fields pass', () => {
    const schema = {
      title: required(),
      content: required(),
    }
    const data = { title: 'Hello', content: 'World' }
    expect(validateForm(schema, data)).toEqual({ valid: true, errors: {} })
  })

  it('returns errors for failed fields with correct messages', () => {
    const schema = {
      title: required(),
      content: required(),
    }
    const data = { title: '', content: '' }
    const result = validateForm(schema, data)
    expect(result.valid).toBe(false)
    expect(result.errors.title).toBe('This field is required')
    expect(result.errors.content).toBe('This field is required')
  })

  it('returns only the first error per field', () => {
    const schema = {
      title: required(),
      username: minLength(3),
    }
    const data = { title: '', username: 'ab' }
    const result = validateForm(schema, data)
    expect(result.errors.title).toBe('This field is required')
    expect(result.errors.username).toBe('Must be at least 3 characters')
  })

  it('handles missing fields gracefully (treated as undefined)', () => {
    const schema = {
      title: required(),
    }
    const data = {} as { title: string }
    const result = validateForm(schema, data)
    expect(result.valid).toBe(false)
    expect(result.errors.title).toBe('This field is required')
  })

  it('validates mixed validator types', () => {
    const schema = {
      name: required(),
      email: email(),
      age: min(18),
    }
    const result = validateForm(schema, {
      name: '',
      email: 'notanemail',
      age: 15,
    })
    expect(result.valid).toBe(false)
    expect(result.errors.name).toBe('This field is required')
    expect(result.errors.email).toBe('Invalid email address')
    expect(result.errors.age).toBe('Must be at least 18')
  })

  it('partial validation — some fields valid, some not', () => {
    const schema = {
      title: required(),
      content: required(),
    }
    const result = validateForm(schema, { title: 'Hello', content: '' })
    expect(result.valid).toBe(false)
    expect(result.errors.title).toBeUndefined()
    expect(result.errors.content).toBe('This field is required')
  })
})
