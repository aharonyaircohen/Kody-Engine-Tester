import { NextRequest } from 'next/server'
import { userStore, sessionStore, jwtService } from '../../../auth'
import { createAuthMiddleware } from '../../../middleware/auth-middleware'
import { getGradebookService } from '../../../services/gradebook'

const auth = createAuthMiddleware(userStore, sessionStore, jwtService)

export const GET = async (request: NextRequest) => {
  const authContext = await auth({
    authorization: request.headers.get('authorization') || undefined,
    ip: request.headers.get('x-forwarded-for') || undefined,
  })

  if (authContext.error) {
    return new Response(JSON.stringify({ error: authContext.error }), {
      status: authContext.status ?? 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const user = authContext.user!

  try {
    const service = await getGradebookService()
    const gradebook = await service.getStudentGradebook(String(user.id))

    return new Response(JSON.stringify({ gradebook }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to load gradebook'
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
