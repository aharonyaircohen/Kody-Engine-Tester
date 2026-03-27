import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFormValidation } from './useFormValidation'
import { required, minLength } from './validators'

describe('useFormValidation', () => {
  it('starts with empty errors', () => {
    const schema = { title: required() }
    const { result } = renderHook(() => useFormValidation(schema))
    expect(result.current.errors).toEqual({})
    expect(result.current.isValid).toBe(true)
  })

  it('validate() sets errors when data is invalid', () => {
    const schema = { title: required() }
    const { result } = renderHook(() => useFormValidation(schema))
    act(() => {
      result.current.validate({ title: '' })
    })
    expect(result.current.errors.title).toBe('This field is required')
    expect(result.current.isValid).toBe(false)
  })

  it('validate() returns valid result when data is valid', () => {
    const schema = { title: required() }
    const { result } = renderHook(() => useFormValidation(schema))
    let validationResult: ReturnType<typeof result.current.validate>
    act(() => {
      validationResult = result.current.validate({ title: 'Hello' })
    })
    expect(validationResult!.valid).toBe(true)
    expect(result.current.errors).toEqual({})
    expect(result.current.isValid).toBe(true)
  })

  it('clearErrors() resets errors and isValid', () => {
    const schema = { title: required() }
    const { result } = renderHook(() => useFormValidation(schema))
    act(() => {
      result.current.validate({ title: '' })
    })
    expect(result.current.isValid).toBe(false)
    act(() => {
      result.current.clearErrors()
    })
    expect(result.current.errors).toEqual({})
    expect(result.current.isValid).toBe(true)
  })

  it('validates multiple fields in schema', () => {
    const schema = {
      title: required(),
      content: minLength(5),
    }
    const { result } = renderHook(() => useFormValidation(schema))
    act(() => {
      result.current.validate({ title: 'Hello', content: 'ab' })
    })
    expect(result.current.errors.title).toBeUndefined()
    expect(result.current.errors.content).toBe('Must be at least 5 characters')
  })

  it('validates full schema with multiple errors', () => {
    const schema = {
      title: required(),
      content: required(),
    }
    const { result } = renderHook(() => useFormValidation(schema))
    act(() => {
      result.current.validate({ title: '', content: '' })
    })
    expect(result.current.errors.title).toBe('This field is required')
    expect(result.current.errors.content).toBe('This field is required')
    expect(result.current.isValid).toBe(false)
  })
})
