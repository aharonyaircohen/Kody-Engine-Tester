import { describe, it, expect } from 'vitest'

describe('GET /api/ping', () => {
  it('returns ok true with status 200', async () => {
    const response = await fetch('http://localhost:3000/api/ping')
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body).toEqual({ ok: true })
  })
})
