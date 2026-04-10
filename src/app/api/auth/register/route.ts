import { NextRequest } from 'next/server'
import type { CollectionSlug } from 'payload'
import { AuthService } from '@/auth/auth-service'
import { JwtService } from '@/auth/jwt-service'
import { getPayloadInstance } from '@/services/progress'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character'
  return null
}

function getJwtService(): JwtService {
  return new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
}

function getAuthService(payload: any): AuthService {
  return new AuthService(payload, getJwtService())
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (!EMAIL_REGEX.test(email)) {
      return Response.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const strengthError = validatePasswordStrength(password)
    if (strengthError) {
      return Response.json(
        { error: strengthError },
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
        { error: 'Email already in use' },
        { status: 409 }
      )
    }

    // Create user - Payload handles password hashing via its internal mechanism
    await payload.create({
      collection: 'users' as CollectionSlug,
      data: {
        email,
        password,
        role: 'viewer',
      } as any,
    })

    // Get tokens via login
    const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'

    const authService = getAuthService(payload)
    const result = await authService.login(email, password, ipAddress, userAgent)

    return Response.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    const status = (error as Error & { status?: number }).status ?? 500

    return Response.json(
      { error: message },
      { status }
    )
  }
}