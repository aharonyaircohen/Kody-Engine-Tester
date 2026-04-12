import { describe, it, expect } from 'vitest'
import express, { type Express } from 'express'
import request from 'supertest'
import { createTimestampMiddleware } from './timestamp-middleware'

function createTestApp(middleware: ReturnType<typeof createTimestampMiddleware>): Express {
  const app = express()
  app.use(middleware)
  app.get('/test', (req, res) => {
    res.json({ message: 'ok' })
  })
  app.post('/test', (req, res) => {
    res.send('created')
  })
  return app
}

describe('createTimestampMiddleware', () => {
  it('adds X-Response-Time header with value in milliseconds', async () => {
    const middleware = createTimestampMiddleware()
    const app = createTestApp(middleware)

    const response = await request(app).get('/test')

    expect(response.headers['x-response-time']).toBeDefined()
    const headerValue = response.headers['x-response-time']
    expect(headerValue).toMatch(/^\d+$/)
    const responseTime = parseInt(headerValue as string, 10)
    expect(responseTime).toBeGreaterThanOrEqual(0)
  })

  it('calls next() to pass control', async () => {
    const middleware = createTimestampMiddleware()
    const app = createTestApp(middleware)

    const response = await request(app).get('/test')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ message: 'ok' })
  })

  it('uses custom header name when configured', async () => {
    const middleware = createTimestampMiddleware({ headerName: 'X-Custom-Time' })
    const app = createTestApp(middleware)

    const response = await request(app).get('/test')

    expect(response.headers['x-custom-time']).toBeDefined()
    expect(response.headers['x-response-time']).toBeUndefined()
  })

  it('works with POST requests', async () => {
    const middleware = createTimestampMiddleware()
    const app = createTestApp(middleware)

    const response = await request(app).post('/test')

    expect(response.status).toBe(200)
    expect(response.headers['x-response-time']).toBeDefined()
  })

  it('header value is a non-negative number string', async () => {
    const middleware = createTimestampMiddleware()
    const app = createTestApp(middleware)

    const response = await request(app).get('/test')

    const headerValue = response.headers['x-response-time']
    expect(headerValue).toMatch(/^\d+$/)
    const responseTime = parseInt(headerValue as string, 10)
    expect(responseTime).toBeGreaterThanOrEqual(0)
  })
})