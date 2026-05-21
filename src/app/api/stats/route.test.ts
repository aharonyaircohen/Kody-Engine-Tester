import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

const mockPayload = {
  find: vi.fn(),
}

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => Promise.resolve(mockPayload)),
}))

describe('GET /api/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns summary stats for two lesson ids', async () => {
    mockPayload.find
      .mockResolvedValueOnce({ totalDocs: 3 })
      .mockResolvedValueOnce({ totalDocs: 1 })

    const request = new NextRequest('http://localhost/api/stats?ids=lesson1,lesson2')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toHaveProperty('mean')
    expect(body).toHaveProperty('median')
    expect(body).toHaveProperty('mode')
    expect(body).toHaveProperty('stdDev')
    expect(body).toHaveProperty('count', 2)
    // counts = [3, 1] → mean = 2, median = 2, mode = null (no duplicate)
    expect(body.mean).toBe(2)
    expect(body.median).toBe(2)
    expect(body.mode).toBeNull()
  })

  it('returns 400 when ids param is missing', async () => {
    const request = new NextRequest('http://localhost/api/stats')
    const response = await GET(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('ids query param required')
  })

  it('returns 400 when ids is empty', async () => {
    const request = new NextRequest('http://localhost/api/stats?ids=,,')
    const response = await GET(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('at least one lesson id required')
  })

  it('returns correct stats for single lesson', async () => {
    mockPayload.find.mockResolvedValueOnce({ totalDocs: 5 })

    const request = new NextRequest('http://localhost/api/stats?ids=lesson1')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.count).toBe(1)
    expect(body.mean).toBe(5)
    expect(body.median).toBe(5)
    expect(body.mode).toBe(5)
    expect(body.stdDev).toBeNull()
  })
})
