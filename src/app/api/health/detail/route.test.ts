import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('GET /api/health/detail', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-05T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns health check detail response with correct structure', async () => {
    const request = new NextRequest('http://localhost/api/health/detail')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toHaveProperty('status', 'ok')
    expect(body).toHaveProperty('uptime')
    expect(typeof body.uptime).toBe('number')
    expect(body.uptime).toBeGreaterThanOrEqual(0)
    expect(body).toHaveProperty('version')
    expect(typeof body.version).toBe('string')
    expect(body).toHaveProperty('timestamp', '2026-04-05T12:00:00.000Z')
  })

  it('returns version from package.json', async () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))

    const request = new NextRequest('http://localhost/api/health/detail')
    const response = await GET(request)
    const body = await response.json()

    expect(body.version).toBe(packageJson.version)
  })
})