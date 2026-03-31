import { describe, it, expect } from 'vitest'
import { GET } from './route'

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const response = await GET()
    const body = await response.json()

    expect(body.status).toBe('ok')
  })

  it('returns 200 status code', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
  })

  it('returns a Unix timestamp', async () => {
    const response = await GET()
    const body = await response.json()

    expect(body.timestamp).toBeDefined()
    expect(typeof body.timestamp).toBe('number')
    expect(body.timestamp).toBeGreaterThan(0)
  })

  it('returns application/json content type', async () => {
    const response = await GET()
    expect(response.headers.get('Content-Type')).toBe('application/json')
  })
})
