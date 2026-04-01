import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import { AuthProvider, AuthContext } from './auth-context'
import type { AuthContextType } from './auth-context'
import { useContext, useEffect } from 'react'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

function TestConsumer() {
  const auth = useContext(AuthContext)
  return (
    <div>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="email">{auth.user?.email ?? ''}</span>
      <button data-testid="logout" onClick={() => auth.logout()}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('provides default unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )
    expect(screen.getByTestId('authenticated').textContent).toBe('false')
    expect(screen.getByTestId('email').textContent).toBe('')
  })

  it('login updates state', async () => {
    // Mock fetch for login
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: '1', email: 'test@example.com', role: 'user' },
      }),
    })

    const authCtxRef = { value: null as AuthContextType | null }
    function CaptureLogin() {
      const ctx = useContext(AuthContext)
      useEffect(() => { authCtxRef.value = ctx })
      return null
    }

    render(
      <AuthProvider>
        <CaptureLogin />
        <TestConsumer />
      </AuthProvider>
    )

    await act(async () => {
      await authCtxRef.value!.login('test@example.com', 'Password1!')
    })

    expect(screen.getByTestId('authenticated').textContent).toBe('true')
    expect(screen.getByTestId('email').textContent).toBe('test@example.com')
  })

  it('logout clears state', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          user: { id: '1', email: 'test@example.com', role: 'user' },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })

    const authCtxRef2 = { value: null as AuthContextType | null }
    function CaptureLogout() {
      const ctx = useContext(AuthContext)
      useEffect(() => { authCtxRef2.value = ctx })
      return null
    }

    render(
      <AuthProvider>
        <CaptureLogout />
        <TestConsumer />
      </AuthProvider>
    )

    await act(async () => {
      await authCtxRef2.value!.login('test@example.com', 'Password1!')
    })

    await act(async () => {
      await authCtxRef2.value!.logout()
    })

    expect(screen.getByTestId('authenticated').textContent).toBe('false')
  })

  it('register updates state', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: '2', email: 'new@example.com', role: 'user' },
      }),
    })

    const authCtxRef3 = { value: null as AuthContextType | null }
    function CaptureRegister() {
      const ctx = useContext(AuthContext)
      useEffect(() => { authCtxRef3.value = ctx })
      return null
    }

    render(
      <AuthProvider>
        <CaptureRegister />
        <TestConsumer />
      </AuthProvider>
    )

    await act(async () => {
      await authCtxRef3.value!.register('new@example.com', 'Pass1!xxx', 'Pass1!xxx')
    })

    expect(screen.getByTestId('authenticated').textContent).toBe('true')
  })
})
