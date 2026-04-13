'use client'
import { useState, useContext, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthContext } from '../../contexts/auth-context'
import { AuthForm } from '../../components/auth/AuthForm'
import { PasswordStrengthBar } from '../../components/auth/PasswordStrengthBar'
import { useFormValidation } from '../../validation/useFormValidation'
import { email, passwordStrength, confirmPassword } from '../../validation/validators'
import type { ValidatorResult } from '../../validation/validators'

type FormData = {
  email: string
  password: string
  confirmPassword: string
  terms: boolean
  [key: string]: unknown
}

export default function RegisterPage() {
  const { register } = useContext(AuthContext)
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const schema = useMemo(
    () => ({
      email: email(),
      password: passwordStrength(),
      confirmPassword: confirmPassword(formData.password),
      terms: (value: unknown): ValidatorResult =>
        value === true
          ? { valid: true }
          : { valid: false, error: 'You must accept the terms' },
    }),
    [formData.password],
  )

  const { errors, validate, isValid } = useFormValidation(schema as { [K in keyof FormData]: (value: FormData[K]) => ValidatorResult })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const result = validate(formData)
    if (!result.valid) return
    setLoading(true)
    try {
      await register(formData.email, formData.password, formData.confirmPassword)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(field: keyof FormData, value: string | boolean) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <AuthForm title="Create Account" error={error} onSubmit={handleSubmit} submitLabel={loading ? 'Creating account...' : 'Register'}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={e => handleChange('email', e.target.value)}
          required
          style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
        />
        {errors.email && <span style={{ color: '#ef4444', fontSize: 12 }}>{errors.email}</span>}
      </div>
      <div style={{ marginTop: 12 }}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={e => handleChange('password', e.target.value)}
          required
          style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
        />
        <PasswordStrengthBar password={formData.password} />
        {errors.password && <span style={{ color: '#ef4444', fontSize: 12, display: 'block', marginTop: 4 }}>{errors.password}</span>}
      </div>
      <div style={{ marginTop: 12 }}>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={e => handleChange('confirmPassword', e.target.value)}
          required
          style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
        />
        {errors.confirmPassword && <span style={{ color: '#ef4444', fontSize: 12 }}>{errors.confirmPassword}</span>}
      </div>
      <div style={{ marginTop: 12 }}>
        <label>
          <input
            type="checkbox"
            checked={formData.terms}
            onChange={e => handleChange('terms', e.target.checked)}
          />
          {' '}I accept the terms and conditions
        </label>
        {errors.terms && <span style={{ color: '#ef4444', fontSize: 12, display: 'block' }}>{errors.terms}</span>}
      </div>
      <div style={{ marginTop: 12 }}>
        <Link href="/auth/login">Already have an account? Sign in</Link>
      </div>
    </AuthForm>
  )
}
