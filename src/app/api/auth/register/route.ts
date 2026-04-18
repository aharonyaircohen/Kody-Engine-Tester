import { NextRequest } from 'next/server'
import { register } from '@/api/auth/register'
import { getAuthService } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0'
  )
}

export const POST = async (request: NextRequest) => {
  let body: { email?: unknown; password?: unknown; confirmPassword?: unknown }

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : ''

  const ipAddress = getClientIp(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'

  try {
    const payload = await getPayloadInstance()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const authService = getAuthService()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await register(email, password, confirmPassword, ipAddress, userAgent, payload as any, authService as any)

    return Response.json(result, { status: 201 })
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : 'Registration failed'
    return Response.json({ error: message }, { status })
  }
}
