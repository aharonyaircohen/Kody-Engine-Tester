import { describe, it, expect } from 'vitest'
import { createErrorResponse, createJsonResponse } from './api-response'

describe('createErrorResponse', () => {
  it('returns a Response with the correct status', async () => {
    const res = createErrorResponse('Not found', 404)
    expect(res.status).toBe(404)
  })

  it('sets Content-Type to application/json', async () => {
    const res = createErrorResponse('Bad request', 400)
    expect(res.headers.get('Content-Type')).toBe('application/json')
  })

  it('serializes { error: message } as JSON body', async () => {
    const res = createErrorResponse('Unauthorized', 401)
    const body = await res.json()
    expect(body).toEqual({ error: 'Unauthorized' })
  })
})

describe('createJsonResponse', () => {
  it('defaults to status 200', async () => {
    const res = createJsonResponse({ ok: true })
    expect(res.status).toBe(200)
  })

  it('uses custom status when provided', async () => {
    const res = createJsonResponse({ id: 1 }, 201)
    expect(res.status).toBe(201)
  })

  it('sets Content-Type to application/json', async () => {
    const res = createJsonResponse({ data: [] })
    expect(res.headers.get('Content-Type')).toBe('application/json')
  })

  it('serializes an object body correctly', async () => {
    const payload = { id: '123', title: 'Quiz 1', score: 85 }
    const res = createJsonResponse(payload)
    const body = await res.json()
    expect(body).toEqual(payload)
  })

  it('serializes an array body correctly', async () => {
    const payload = [{ id: 1 }, { id: 2 }]
    const res = createJsonResponse(payload)
    const body = await res.json()
    expect(body).toEqual(payload)
  })

  it('uses 201 for created responses', async () => {
    const res = createJsonResponse({ enrolledId: 'abc' }, 201)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body).toEqual({ enrolledId: 'abc' })
  })
})
