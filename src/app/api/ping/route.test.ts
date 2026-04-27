import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/ping', () => {
  it('returns ok true with status 200', async () => {
    const request = new NextRequest('http://localhost/api/ping')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toHaveProperty('ok', true)
  })

  it('returns valid JSON', async () => {
    const request = new NextRequest('http://localhost/api/ping')
    const response = await GET(request)

    const body = await response.json()
    expect(body).toEqual({ ok: true })
  })
})
