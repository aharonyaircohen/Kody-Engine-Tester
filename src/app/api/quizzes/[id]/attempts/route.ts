import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'

export const GET = withAuth(
  async (
    _request: NextRequest,
    { user },
    routeParams?: { params: Promise<{ id: string }> },
  ) => {
    const params = await routeParams?.params
    const id = params?.id

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const payload = await getPayload({ config: configPromise })

    const attempts = await payload.find({
      collection: 'quiz-attempts' as any,
      where: {
        user: { equals: user.id },
        quiz: { equals: id },
      },
      sort: '-completedAt',
      limit: 100,
    })

    return new Response(
      JSON.stringify({
        attempts: attempts.docs.map((doc: any) => ({
          id: doc.id,
          score: doc.score,
          passed: doc.passed,
          answers: doc.answers,
          completedAt: doc.completedAt,
        })),
        total: attempts.totalDocs,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
)
