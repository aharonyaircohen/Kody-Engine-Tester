import { NextRequest } from 'next/server'
import { AuthService } from '@/auth/auth-service'
import { JwtService } from '@/auth/jwt-service'
import { getPayloadInstance } from '@/services/progress'

function getJwtService(): JwtService {
  return new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
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

    // Extract IP and user agent for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'

    const payload = await getPayloadInstance()
    const authService = new AuthService(payload as any, getJwtService())
    const result = await authService.login(email, password, ipAddress, userAgent)

    return Response.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid credentials'
    const status = (error as Error & { status?: number }).status ?? 401

    // Return generic error message for auth failures to avoid leaking info
    if (status === 401) {
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    return Response.json(
      { error: message },
      { status }
    )
  }
}