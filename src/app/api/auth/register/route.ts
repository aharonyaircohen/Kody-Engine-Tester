import { NextRequest } from 'next/server'
import { getPayloadInstance } from '@/services/progress'
import { AuthService } from '@/auth/auth-service'
import { JwtService } from '@/auth/jwt-service'
import { register } from '@/api/auth/register'

let jwtServiceInstance: JwtService | null = null
let authServiceInstance: AuthService | null = null

function getJwtService(): JwtService {
  if (!jwtServiceInstance) {
    jwtServiceInstance = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
  }
  return jwtServiceInstance
}

function getAuthService(payload: Awaited<ReturnType<typeof getPayloadInstance>>): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService(payload as any, getJwtService())
  }
  return authServiceInstance
}

function getClientInfo(request: NextRequest): { ipAddress: string; userAgent: string } {
  const forwarded = request.headers.get('x-forwarded-for')
  const ipAddress = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') ?? '127.0.0.1'
  const userAgent = request.headers.get('user-agent') ?? 'Unknown'
  return { ipAddress, userAgent }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadInstance()
    const authService = getAuthService(payload)
    const { ipAddress, userAgent } = getClientInfo(request)

    const body = await request.json()
    const { email, password, confirmPassword } = body

    const result = await register(
      email,
      password,
      confirmPassword,
      ipAddress,
      userAgent,
      payload,
      authService
    )

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : 'Registration failed'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}