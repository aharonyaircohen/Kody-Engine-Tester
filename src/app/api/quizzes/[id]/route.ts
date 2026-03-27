import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params

  const payload = await getPayload({ config: configPromise })

  const quiz = await payload.findByID({
    collection: 'quizzes' as any,
    id,
    depth: 0,
  }) as any

  if (!quiz) {
    return new Response(JSON.stringify({ error: 'Quiz not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Return quiz metadata and questions (without revealing correct answers)
  const questions = ((quiz.questions as any[]) ?? []).map((q) => ({
    text: q.text,
    type: q.type,
    options: ((q.options as any[]) ?? []).map((o: { text: string }) => ({ text: o.text })),
  }))

  return new Response(
    JSON.stringify({
      id: quiz.id,
      title: quiz.title,
      module: quiz.module,
      order: quiz.order,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit,
      maxAttempts: quiz.maxAttempts,
      questions,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}
