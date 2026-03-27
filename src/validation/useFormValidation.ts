'use client'
import { useState, useCallback } from 'react'
import { validateForm } from './validateForm'
import type { Validator } from './validators'

export function useFormValidation<T extends Record<string, unknown>>(
  schema: { [K in keyof T]: Validator<T[K]> },
) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = useCallback(
    (data: T) => {
      const result = validateForm(schema, data)
      setErrors(result.errors)
      return result
    },
    [schema],
  )

  const clearErrors = useCallback(() => setErrors({}), [])

  const isValid = Object.keys(errors).length === 0

  return { errors, validate, isValid, clearErrors }
}
