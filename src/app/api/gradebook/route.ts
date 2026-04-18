import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'
import { PayloadGradebookService } from '@/services/gradebook-payload'

/**
 * GET /api/gradebook
 * Returns the current viewer's gradebook across all enrolled courses.
 * Requires viewer role (formerly student).
 */
export const GET = withAuth(async (_request: NextRequest, { user }) => {
  const payload = await getPayloadInstance()
  const gradebookSvc = new PayloadGradebookService(payload)

  const gradebook = await gradebookSvc.getStudentGradebook(String(user!.id))

  return new Response(JSON.stringify(gradebook), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}, { roles: ['viewer', 'admin', 'editor'] })
