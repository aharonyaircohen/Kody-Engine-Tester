import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'
import { GradingEngine } from '@/services/grading-engine'

export const GET = withAuth(
  async (
    _request: NextRequest,
    { user },
    routeParams?: { params: Promise<{ id: string }> },
  ) => {
    if (!user) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const params = await routeParams?.params
    const id = params?.id

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const payload = await getPayload({ config: configPromise })
    const engine = new GradingEngine({ payload })

    const { attempts, total } = await engine.getQuizAttempts(String(user.id), id)

    return new Response(
      JSON.stringify({ attempts, total }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
)
