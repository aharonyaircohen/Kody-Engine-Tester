import { NextRequest } from 'next/server'
import type { CollectionSlug } from 'payload'
import crypto from 'crypto'
import type { AuthResult } from '@/auth/auth-service'
import { AuthService } from '@/auth/auth-service'
import { JwtService } from '@/auth/jwt-service'
import { getPayloadInstance } from '@/services/progress'
import { s } from '@/utils/schema'

const RegisterSchema = s.object({
  email: s.string(),
  password: s.string(),
  confirmPassword: s.string().optional(),
})

const MIN_PASSWORD_LENGTH = 8

function buildJwtService(): JwtService {
  return new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
}

async function buildAuthService(): Promise<AuthService> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new AuthService(await getPayloadInstance() as any, buildJwtService())
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  return '0.0.0.0'
}

/**
 * Hash password using PBKDF2 — matches Payload's generatePasswordSaltHash algorithm:
 * 25000 iterations, sha256, 512 bits (64 bytes).
 */
function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 25000, 64, 'sha256', (err, derivedKey) => {
      if (err) {
        reject(err)
        return
      }
      resolve(derivedKey.toString('hex'))
    })
  })
}

export interface RegisterDeps {
  authService?: AuthService
  payloadInstance?: Awaited<ReturnType<typeof getPayloadInstance>>
}

export const POST = async (
  request: NextRequest,
  deps?: RegisterDeps
): Promise<Response> => {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  let validated: { email: string; password: string; confirmPassword?: string }
  try {
    validated = RegisterSchema.parse(body)
  } catch (e) {
    return Response.json(
      { error: (e as Error).message },
      { status: 400 }
    )
  }

  const { email, password, confirmPassword } = validated

  if (confirmPassword !== undefined && confirmPassword !== password) {
    return Response.json(
      { error: 'Passwords do not match' },
      { status: 400 }
    )
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return Response.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 }
    )
  }

  const payload = deps?.payloadInstance ?? (await getPayloadInstance())

  // Check for duplicate email
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

  // Generate salt and hash password
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = await hashPassword(password, salt)

  const ipAddress = getClientIp(request)
  const userAgent = request.headers.get('user-agent') ?? 'unknown'

  // Create user in Payload
  const newUser = await payload.create({
    collection: 'users' as CollectionSlug,
    data: {
      email,
      hash,
      salt,
      role: 'viewer',
      isActive: true,
    } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  })

  const newUserId = (newUser as any).id

  // Log the user in to issue JWT tokens
  const authService = deps?.authService ?? (await buildAuthService())

  try {
    const result: AuthResult = await authService.login(
      email,
      password,
      ipAddress,
      userAgent
    )
    return Response.json(result, { status: 201 })
  } catch (err) {
    const error = err as Error & { status?: number }
    // If login fails after registration, clean up the created user
    try {
      await payload.delete({
        collection: 'users' as CollectionSlug,
        id: newUserId,
      })
    } catch {
      // Non-critical — log and continue
    }
    const status = error.status ?? 500
    return Response.json(
      { error: error.message ?? 'Registration failed' },
      { status }
    )
  }
}
