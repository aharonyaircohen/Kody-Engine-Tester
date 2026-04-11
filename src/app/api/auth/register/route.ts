import { NextRequest } from 'next/server'
import type { CollectionSlug } from 'payload'
import { getPayloadInstance } from '@/services/progress'
import { email, minLength } from '@/validation/validators'

function createError(message: string, status: number) {
  const err = new Error(message) as Error & { status: number }
  err.status = status
  return err
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email: emailValue, password } = body

    // Input validation
    const emailResult = email()(emailValue)
    if (!emailResult.valid) {
      return new Response(JSON.stringify({ error: emailResult.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const passwordResult = minLength(8)(password)
    if (!passwordResult.valid) {
      return new Response(JSON.stringify({ error: passwordResult.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const payload = await getPayloadInstance()

    // Check for duplicate email
    const existing = await payload.find({
      collection: 'users' as CollectionSlug,
      where: { email: { equals: emailValue } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Derive firstName/lastName from email prefix
    const emailPrefix = emailValue.split('@')[0]
    const [firstName, ...lastNameParts] = emailPrefix.split(/[._-]/)
    const lastName = lastNameParts.join(' ') || emailPrefix

    // Create user with hashed password using Payload's built-in auth
    // firstName/lastName derived from email prefix
    const user = await payload.create({
      collection: 'users' as CollectionSlug,
      data: {
        email: emailValue,
        password,
        firstName: firstName || emailPrefix,
        lastName: lastName || emailPrefix,
        role: 'viewer',
      } as any,
    })

    return new Response(
      JSON.stringify({
        id: (user as any).id,
        email: (user as any).email,
        firstName: (user as any).firstName,
        lastName: (user as any).lastName,
        role: (user as any).role,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    const status = (err as { status?: number }).status || 500
    const message = err instanceof Error ? err.message : 'Registration failed'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}