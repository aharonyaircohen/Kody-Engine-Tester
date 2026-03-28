import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'
import { createErrorResponse, createJsonResponse } from '../../../../../utils/api-response'

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return createErrorResponse('userId query parameter is required', 400)
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

  return createJsonResponse({
    attempts: attempts.docs.map((doc: any) => ({
      id: doc.id,
      score: doc.score,
      passed: doc.passed,
      answers: doc.answers,
      completedAt: doc.completedAt,
    })),
    total: attempts.totalDocs,
  })
}
