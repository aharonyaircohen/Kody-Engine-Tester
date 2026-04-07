import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    // The withAuth middleware already validated the token.
    // Logout is handled client-side by discarding the tokens.
    // Server-side we could blacklist the token, but for now we just return success.

    return Response.json({ message: 'Logged out successfully' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Logout failed'
    return Response.json({ error: message }, { status: 500 })
  }
})