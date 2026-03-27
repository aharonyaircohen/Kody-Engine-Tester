'use client'
import { useState, useContext } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthContext } from '../../contexts/auth-context'
import { AuthForm } from '../../components/auth/AuthForm'

export default function LoginPage() {
  const { login } = useContext(AuthContext)
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Email and password are required')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthForm title="Sign In" error={error} onSubmit={handleSubmit} submitLabel={loading ? 'Signing in...' : 'Sign In'}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label>
          <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
          {' '}Remember me
        </label>
      </div>
      <div style={{ marginTop: 12 }}>
        <Link href="/auth/register">Don&apos;t have an account? Register</Link>
      </div>
    </AuthForm>
  )
}
