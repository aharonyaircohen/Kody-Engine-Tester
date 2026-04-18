import configPromise from '@payload-config'
import type { CollectionSlug } from 'payload'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'

type QuizAttemptDoc = {
  id: unknown
  score: unknown
  passed: unknown
  answers: unknown
  completedAt: unknown
}

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: 'quiz-attempts' as unknown as CollectionSlug,
      where: {
        user: { equals: user!.id },
        quiz: { equals: id },
      },
      sort: '-completedAt',
      limit: 100,
    })

    return new Response(
      JSON.stringify({
        attempts: (attempts.docs as unknown as QuizAttemptDoc[]).map((doc) => ({
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
