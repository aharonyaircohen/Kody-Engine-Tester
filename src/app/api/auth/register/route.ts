import { NextRequest } from 'next/server'
import type { CollectionSlug } from 'payload'
import { getPayloadInstance } from '@/services/progress'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName } = body

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (!firstName || !lastName) {
      return Response.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      )
    }

    const payload = await getPayloadInstance()

    // Check if user already exists
    const existing = await payload.find({
      collection: 'users' as CollectionSlug,
      where: { email: { equals: email } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return Response.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Create the user with default viewer role
    const user = await payload.create({
      collection: 'users' as CollectionSlug,
      data: {
        email,
        password,
        firstName,
        lastName,
        role: 'viewer',
      } as any,
    })

    return Response.json({
      message: 'User registered successfully',
      user: {
        id: (user as any).id,
        email: (user as any).email,
        role: (user as any).role,
      },
    }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed'
    return Response.json({ error: message }, { status: 500 })
  }
}