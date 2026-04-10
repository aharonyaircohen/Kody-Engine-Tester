import { NextRequest } from 'next/server'
import { getPayloadInstance } from '@/services/progress'
import { registerUser } from '@/api/auth/register-user'

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
    const user = await registerUser(email, password, payload as any)

    return Response.json(user, {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const error = err as Error & { status?: number }
    const status = error.status ?? 400
    return Response.json(
      { error: error.message ?? 'Registration failed' },
      { status, headers: { 'Content-Type': 'application/json' } }
    )
  }
}