import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/kody-livetest', () => {
  it('returns ok true and probe kody-livetest', async () => {
    const request = new NextRequest('http://localhost/api/kody-livetest')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toHaveProperty('ok', true)
    expect(body).toHaveProperty('probe', 'kody-livetest')
  })
})