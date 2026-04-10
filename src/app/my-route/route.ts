import type { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'

export const GET = withAuth(async (_request: NextRequest, { user }) => {
  return Response.json({
    message: 'This is an example of a protected route.',
    user: { userId: user?.id, email: user?.email },
  })
})
