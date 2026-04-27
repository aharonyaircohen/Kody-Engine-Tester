import { NextRequest } from 'next/server'
import { GET } from './route'

import { describe, it, expect } from 'vitest'

describe('GET /api/ping', () => {
  it('returns ok true with 200 status', async () => {
    const response = await GET(new NextRequest('http://localhost/api/ping'))
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    const body = await response.json()
    expect(body).toEqual({ ok: true })
  })

  it('returns application/json content type header', async () => {
    const response = await GET(new NextRequest('http://localhost/api/ping'))
    expect(response.headers.get('Content-Type')).toContain('application/json')
  })
})
