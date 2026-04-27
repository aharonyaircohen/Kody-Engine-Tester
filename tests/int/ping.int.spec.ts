import { NextRequest } from 'next/server'
import { GET } from '@/app/api/ping/route'

import { it, expect } from 'vitest'

it('GET /api/ping returns ok true with 200', async () => {
  const response = await GET(new NextRequest('http://localhost/api/ping'))
  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toBe('application/json')
  const body = await response.json()
  expect(body).toEqual({ ok: true })
})
