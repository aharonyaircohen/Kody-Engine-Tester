'use client'
import { useState, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext } from '../../contexts/auth-context'
import { AuthForm } from '../../components/auth/AuthForm'
import { PasswordStrengthBar } from '../../components/auth/PasswordStrengthBar'

export default function RegisterPage() {
  const { register } = useContext(AuthContext)
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && !emailRegex.test(email)) {
      setEmailError('Invalid email format')
    } else {
      setEmailError('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!terms) {
      setError('You must accept the terms')
      return
    }
    setLoading(true)
    try {
      await register(email, password, confirmPassword)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthForm title="Create Account" error={error} onSubmit={handleSubmit} submitLabel={loading ? 'Creating account...' : 'Register'}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} onBlur={validateEmail} required style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        {emailError && <span style={{ color: '#ef4444', fontSize: 12 }}>{emailError}</span>}
      </div>
      <div style={{ marginTop: 12 }}>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        <PasswordStrengthBar password={password} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>
          <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} required />
          {' '}I accept the terms and conditions
        </label>
      </div>
      <div style={{ marginTop: 12 }}>
        <a href="/auth/login">Already have an account? Sign in</a>
      </div>
    </AuthForm>
  )
}
