import { NextRequest } from 'next/server'
import { userStore, sessionStore, jwtService } from '../../../auth'
import { createAuthMiddleware } from '../../../middleware/auth-middleware'
import { requireRole } from '../../../middleware/role-guard'
import { getPayloadInstance } from '../../../services/progress'
import { PayloadGradebookService } from '../../../services/gradebook-payload'

const auth = createAuthMiddleware(userStore, sessionStore, jwtService)

/**
 * GET /api/gradebook
 * Returns the current student's gradebook across all enrolled courses.
 * Requires student role.
 */
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
  const payload = await getPayloadInstance()
  const gradebookSvc = new PayloadGradebookService(payload)

  const gradebook = await gradebookSvc.getStudentGradebook(String(user.id))

  return new Response(JSON.stringify(gradebook), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
