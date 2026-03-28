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

  it('returns a valid ISO timestamp', async () => {
    const response = await GET()
    const body = await response.json()

    expect(body.timestamp).toBeDefined()
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp)
  })

  it('returns a version string', async () => {
    const response = await GET()
    const body = await response.json()

    expect(body.version).toBeDefined()
    expect(typeof body.version).toBe('string')
    expect(body.version.length).toBeGreaterThan(0)
  })

  it('returns an uptime value', async () => {
    const response = await GET()
    const body = await response.json()

    expect(body.uptime).toBeDefined()
    expect(typeof body.uptime).toBe('number')
    expect(body.uptime).toBeGreaterThanOrEqual(0)
  })

  it('returns application/json content type', async () => {
    const response = await GET()
    expect(response.headers.get('Content-Type')).toBe('application/json')
  })
})
