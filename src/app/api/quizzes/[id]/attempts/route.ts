import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return new Response(JSON.stringify({ error: 'userId query parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const payload = await getPayload({ config: configPromise })

  const attempts = await payload.find({
    collection: 'quiz-attempts' as any,
    where: {
      user: { equals: userId },
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
