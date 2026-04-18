import { describe, it, expect, beforeAll } from 'vitest'
import { getPayload } from 'payload'
import config from '@/payload.config'

describe('POST /api/auth/register', () => {
  let payload: Awaited<ReturnType<typeof getPayload>>
  const uniqueEmail = `test-${Date.now()}@example.com`
  const uniqueEmail2 = `test2-${Date.now()}@example.com`
  const validPassword = 'TestPass1!'
  const weakPassword = 'Ab1!'

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('POSTs new user credentials and returns 201 with tokens', async () => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: validPassword,
        confirmPassword: validPassword,
      }),
    })

    expect(response.status).toBe(201)

    const body = await response.json()
    expect(body.accessToken).toBeDefined()
    expect(body.refreshToken).toBeDefined()
    expect(body.user.email).toBe(uniqueEmail)
    expect(body.user.role).toBe('viewer')
  })

  it('POSTs duplicate email and returns 409', async () => {
    // First register
    const firstResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail2,
        password: validPassword,
        confirmPassword: validPassword,
      }),
    })
    expect(firstResponse.status).toBe(201)

    // Second registration with same email
    const secondResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail2,
        password: 'AnotherPass1!',
        confirmPassword: 'AnotherPass1!',
      }),
    })

    expect(secondResponse.status).toBe(409)
    const body = await secondResponse.json()
    expect(body.error).toBe('Email already in use')
  })

  it('POSTs weak password and returns 400', async () => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `weak-${Date.now()}@example.com`,
        password: weakPassword,
        confirmPassword: weakPassword,
      }),
    })

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toContain('at least 8 characters')
  })

  it('POSTs mismatched passwords and returns 400', async () => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `mismatch-${Date.now()}@example.com`,
        password: validPassword,
        confirmPassword: 'MismatchPass1!',
      }),
    })

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Passwords do not match')
  })
})
