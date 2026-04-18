import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/healthz', () => {
  it('returns ok with HTTP 200', async () => {
    const request = new NextRequest('http://localhost/api/healthz')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toEqual({ status: 'ok' })
  })
})
