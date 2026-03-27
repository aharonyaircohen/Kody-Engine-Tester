'use client'
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react'

interface AuthUser {
  id: string
  email: string
  role: string
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: (allDevices?: boolean) => Promise<void>
  register: (email: string, password: string, confirmPassword: string) => Promise<void>
  refreshToken: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  refreshToken: async () => {},
})

const ACCESS_TOKEN_KEY = 'auth_access_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'
const REFRESH_BEFORE_EXPIRY_MS = 60 * 1000 // 1 minute

function parseJwtExpiry(token: string): number | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
    return payload.exp ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleRefresh = useCallback((accessToken: string, doRefresh: () => Promise<void>) => {
    const exp = parseJwtExpiry(accessToken)
    if (!exp) return
    const delay = exp - Date.now() - REFRESH_BEFORE_EXPIRY_MS
    if (delay <= 0) return
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    refreshTimerRef.current = setTimeout(doRefresh, delay)
  }, [])

  const logout = useCallback(async (allDevices?: boolean) => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (accessToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ allDevices: allDevices ?? false }),
        })
      } catch {}
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    setUser(null)
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
  }, [])

  const refreshToken = useCallback(async () => {
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!storedRefresh) {
      await logout()
      return
    }
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefresh }),
    })
    if (!res.ok) {
      await logout()
      return
    }
    const data = await res.json()
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
    scheduleRefresh(data.accessToken, refreshToken)
  }, [logout, scheduleRefresh])

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (token) {
      try {
        const parts = token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
          if (payload.exp * 1000 > Date.now()) {
            setUser({ id: payload.userId, email: payload.email, role: payload.role })
            scheduleRefresh(token, refreshToken)
          }
        }
      } catch {}
    }
  }, [scheduleRefresh, refreshToken])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error ?? 'Login failed')
    }
    const data = await res.json()
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
    setUser(data.user)
    scheduleRefresh(data.accessToken, refreshToken)
  }, [scheduleRefresh, refreshToken])

  const register = useCallback(async (email: string, password: string, confirmPassword: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, confirmPassword }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error ?? 'Registration failed')
    }
    const data = await res.json()
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
    setUser(data.user)
    scheduleRefresh(data.accessToken, refreshToken)
  }, [scheduleRefresh, refreshToken])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, register, refreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}
