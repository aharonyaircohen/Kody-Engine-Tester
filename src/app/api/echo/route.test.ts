import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/echo', () => {
  it('returns echo with length and reversed for a normal message', async () => {
    const request = new NextRequest('http://localhost/api/echo?msg=hello')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toEqual({
      echo: 'hello',
      length: 5,
      reversed: 'olleh',
    })
  })

  it('returns 400 with error when msg is missing', async () => {
    const request = new NextRequest('http://localhost/api/echo')
    const response = await GET(request)

    expect(response.status).toBe(400)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toEqual({ error: 'msg is required' })
  })

  it('returns 400 with error when msg is empty', async () => {
    const request = new NextRequest('http://localhost/api/echo?msg=')
    const response = await GET(request)

    expect(response.status).toBe(400)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    const body = await response.json()
    expect(body).toEqual({ error: 'msg is required' })
  })

  it('correctly reverses a multi-word message', async () => {
    const request = new NextRequest('http://localhost/api/echo?msg=hello+world')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.reversed).toBe('dlrow olleh')
  })
})
