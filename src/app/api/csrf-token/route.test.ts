import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'
import { CsrfTokenService, resetCsrfTokenService } from '../../../security/csrf-token'

vi.mock('../../../security/csrf-token', async () => {
  const actual = await vi.importActual('../../../security/csrf-token')
  return {
    ...actual,
    getCsrfTokenService: vi.fn(() => new CsrfTokenService()),
  }
})

describe('GET /api/csrf-token', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-05T12:00:00.000Z'))
    resetCsrfTokenService()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 400 when x-session-id header is missing', async () => {
    const request = new NextRequest('http://localhost/api/csrf-token')
    const response = await GET(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual({ error: 'x-session-id header is required' })
  })

  it('returns 200 with token when x-session-id header is provided', async () => {
    const request = new NextRequest('http://localhost/api/csrf-token', {
      headers: { 'x-session-id': 'test-session-123' },
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    expect(response.headers.get('X-CSRF-Token')).toBeTruthy()

    const body = await response.json()
    expect(body).toHaveProperty('token')
    expect(typeof body.token).toBe('string')
    expect(body.token.length).toBeGreaterThan(0)
  })

  it('returns different tokens for different sessions', async () => {
    const request1 = new NextRequest('http://localhost/api/csrf-token', {
      headers: { 'x-session-id': 'session-1' },
    })
    const request2 = new NextRequest('http://localhost/api/csrf-token', {
      headers: { 'x-session-id': 'session-2' },
    })

    const response1 = await GET(request1)
    const response2 = await GET(request2)

    const body1 = await response1.json()
    const body2 = await response2.json()

    expect(body1.token).not.toBe(body2.token)
  })
})
