import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/status', () => {
  it('returns ok status with 200', async () => {
    const request = new NextRequest('http://localhost/api/status')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toHaveProperty('status', 'ok')
  })
})