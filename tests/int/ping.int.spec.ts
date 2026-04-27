import { GET } from '@/app/api/ping/route'
import { NextRequest } from 'next/server'
import { describe, it, expect } from 'vitest'

describe('GET /api/ping', () => {
  it('returns 200 with ok: true', async () => {
    const request = new NextRequest('http://localhost/api/ping')
    const response = await GET(request)
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    const body = await response.json()
    expect(body).toEqual({ ok: true })
  })
})
