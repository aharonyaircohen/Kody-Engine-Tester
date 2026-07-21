import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'
import { GradingEngine } from '@/services/grading-engine'

/**
 * GET /api/gradebook
 * Returns the current viewer's gradebook across all enrolled courses.
 * Requires viewer role (formerly student).
 */
export const GET = withAuth(async (request: NextRequest, { user }) => {
  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const payload = await getPayloadInstance()
  const engine = new GradingEngine({ payload })

  const gradebook = await engine.getStudentGradebook(String(user.id))

  return new Response(JSON.stringify(gradebook), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}, { roles: ['viewer', 'admin', 'editor'] })
