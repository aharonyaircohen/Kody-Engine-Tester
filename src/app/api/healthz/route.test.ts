import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/healthz', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-05T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    // Reset stubs manually (vi.unstubEnv not available in vitest 4.0.18)
    delete process.env.APP_VERSION
    delete process.env.GIT_SHA
    delete process.env.BUILD_TIMESTAMP
    delete process.env.npm_package_version
  })

  it('returns 200 with correct JSON shape', async () => {
    const request = new NextRequest('http://localhost/api/healthz')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toHaveProperty('status', 'ok')
    expect(body).toHaveProperty('version')
    expect(typeof body.version).toBe('string')
    expect(body).toHaveProperty('commit')
    expect(typeof body.commit).toBe('string')
    expect(body).toHaveProperty('builtAt')
    expect(typeof body.builtAt).toBe('string')
  })

  it('uses BUILD_TIMESTAMP env var when set', async () => {
    vi.stubEnv('BUILD_TIMESTAMP', '2026-01-01T00:00:00.000Z')
    const request = new NextRequest('http://localhost/api/healthz')
    const response = await GET(request)
    const body = await response.json()
    expect(body.builtAt).toBe('2026-01-01T00:00:00.000Z')
    vi.unstubAllEnvs()
  })

  it('falls back to runtime ISO string when BUILD_TIMESTAMP is unset', async () => {
    vi.unstubAllEnvs()
    const request = new NextRequest('http://localhost/api/healthz')
    const response = await GET(request)
    const body = await response.json()
    expect(body.builtAt).toBe('2026-04-05T12:00:00.000Z')
  })

  it('uses GIT_SHA env var when set', async () => {
    vi.stubEnv('GIT_SHA', 'abc1234')
    const request = new NextRequest('http://localhost/api/healthz')
    const response = await GET(request)
    const body = await response.json()
    expect(body.commit).toBe('abc1234')
    vi.unstubAllEnvs()
  })

  it('falls back to "unknown" when GIT_SHA is unset', async () => {
    vi.unstubAllEnvs()
    const request = new NextRequest('http://localhost/api/healthz')
    const response = await GET(request)
    const body = await response.json()
    expect(body.commit).toBe('unknown')
  })

  it('uses APP_VERSION env var when set', async () => {
    vi.stubEnv('APP_VERSION', '2.0.0')
    const request = new NextRequest('http://localhost/api/healthz')
    const response = await GET(request)
    const body = await response.json()
    expect(body.version).toBe('2.0.0')
    vi.unstubAllEnvs()
  })

  it('falls back to npm_package_version when APP_VERSION is unset', async () => {
    vi.stubEnv('npm_package_version', '1.2.3')
    const request = new NextRequest('http://localhost/api/healthz')
    const response = await GET(request)
    const body = await response.json()
    expect(body.version).toBe('1.2.3')
  })

  it('falls back to "unknown" when no version env var is set', async () => {
    // No stubs — both APP_VERSION and npm_package_version are deleted by afterEach
    const request = new NextRequest('http://localhost/api/healthz')
    const response = await GET(request)
    const body = await response.json()
    expect(body.version).toBe('unknown')
  })
})
