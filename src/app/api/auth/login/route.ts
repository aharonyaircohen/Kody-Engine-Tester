import { NextRequest } from 'next/server'
import { AuthService } from '@/auth/auth-service'
import { JwtService } from '@/auth/jwt-service'
import { getPayloadInstance } from '@/services/progress'

let jwtServiceInstance: JwtService | null = null
let authServiceInstance: AuthService | null = null

function getJwtService(): JwtService {
  if (!jwtServiceInstance) {
    jwtServiceInstance = new JwtService(
      process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production'
    )
  }
  return jwtServiceInstance
}

function getAuthService(payload: Awaited<ReturnType<typeof getPayloadInstance>>): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService(payload, getJwtService())
  }
  return authServiceInstance
}

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const payload = await getPayloadInstance()
    const authService = getAuthService(payload)
    const result = await authService.login(
      email,
      password,
      '0.0.0.0',
      request.headers.get('user-agent') ?? ''
    )

    return Response.json(result, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const error = err as Error & { status?: number }
    const status = error.status ?? 401
    return Response.json(
      { error: error.message ?? 'Authentication failed' },
      { status, headers: { 'Content-Type': 'application/json' } }
    )
  }
}