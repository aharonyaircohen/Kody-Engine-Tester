import { NextRequest } from 'next/server'
import { userStore, sessionStore, jwtService } from '../../../auth'
import { createAuthMiddleware } from '../../../middleware/auth-middleware'
import { requireRole } from '../../../middleware/role-guard'
import { PayloadGradebookService } from '../../../services/gradebook'
import { getPayloadInstance } from '../../../services/progress'

const auth = createAuthMiddleware(userStore, sessionStore, jwtService)

// GET /api/gradebook — returns the authenticated student's own gradebook
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

  const roleError = requireRole('student')(authContext)
  if (roleError) {
    return new Response(JSON.stringify({ error: roleError.error }), {
      status: roleError.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const user = authContext.user!
  const studentId = String(user.id)

  const payload = await getPayloadInstance()
  const gradebookService = new PayloadGradebookService(payload)

  try {
    const gradebook = await gradebookService.getStudentGradebook(studentId)
    return new Response(JSON.stringify(gradebook), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
