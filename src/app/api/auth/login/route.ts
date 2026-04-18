import { NextRequest } from 'next/server'
import type { AuthResult } from '@/auth/auth-service'
import { AuthService } from '@/auth/auth-service'
import { JwtService } from '@/auth/jwt-service'
import { getPayloadInstance } from '@/services/progress'
import { s } from '@/utils/schema'

const LoginSchema = s.object({
  email: s.string(),
  password: s.string(),
})

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

export interface LoginDeps {
  authService?: AuthService
}

export const POST = async (
  request: NextRequest,
  deps?: LoginDeps
): Promise<Response> => {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  let validated: { email: string; password: string }
  try {
    validated = LoginSchema.parse(body)
  } catch (e) {
    return Response.json(
      { error: (e as Error).message },
      { status: 400 }
    )
  }

  const ipAddress = getClientIp(request)
  const userAgent = request.headers.get('user-agent') ?? 'unknown'

  const authService = deps?.authService ?? (await buildAuthService())

  try {
    const result: AuthResult = await authService.login(
      validated.email,
      validated.password,
      ipAddress,
      userAgent
    )
    return Response.json(result, { status: 200 })
  } catch (err) {
    const error = err as Error & { status?: number }
    const status = error.status ?? 401
    // Don't leak internal details — generic message for auth failures
    return Response.json(
      { error: error.message ?? 'Authentication failed' },
      { status }
    )
  }
}
