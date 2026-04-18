import configPromise from '@payload-config'
import type { CollectionSlug } from 'payload'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'
import { gradeQuiz, type Quiz, type QuizAnswer } from '@/services/quiz-grader'
import { withAuth } from '@/auth/withAuth'

type QuizQuestionOption = { text: string; isCorrect: boolean }
type QuizQuestion = {
  text: string
  type: 'multiple-choice' | 'true-false' | 'short-answer'
  options: QuizQuestionOption[]
  correctAnswer?: string
  points: number
}
type QuizDoc = {
  id: string
  title: string
  passingScore?: number
  maxAttempts?: number
  questions?: QuizQuestion[]
}
type QuizAttemptData = {
  user: unknown
  quiz: unknown
  score: number
  passed: boolean
  answers: { questionIndex: number; answer: string }[]
  completedAt: string
}

export const POST = withAuth(
  async (
    request: NextRequest,
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

    let body: { answers: QuizAnswer[] }
    try {
      body = await request.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { answers } = body

    if (!Array.isArray(answers)) {
      return new Response(
        JSON.stringify({ error: 'answers array is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    const payload = await getPayload({ config: configPromise })

    // Fetch the quiz from Payload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quizDoc = (await payload.findByID({
      collection: 'quizzes' as unknown as CollectionSlug,
      id,
      depth: 0,
    })) as unknown as QuizDoc | null

    if (!quizDoc) {
      return new Response(JSON.stringify({ error: 'Quiz not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Convert Payload quiz doc to internal Quiz format
    const quiz: Quiz = {
      id: quizDoc.id,
      title: quizDoc.title,
      passingScore: quizDoc.passingScore ?? 70,
      maxAttempts: quizDoc.maxAttempts ?? 3,
      questions: (quizDoc.questions ?? []).map((q) => ({
        text: q.text,
        type: q.type,
        options: (q.options ?? []).map((o) => ({
          text: o.text,
          isCorrect: o.isCorrect,
        })),
        correctAnswer: q.correctAnswer,
        points: q.points ?? 1,
      })),
    }

    // Check attempt count
    const existingAttempts = await payload.find({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: 'quiz-attempts' as unknown as CollectionSlug,
      where: {
        user: { equals: user!.id },
        quiz: { equals: id },
      },
      limit: 0,
    })
    const attemptCount = existingAttempts.totalDocs

    if (attemptCount >= quiz.maxAttempts) {
      return new Response(
        JSON.stringify({
          error: 'Maximum attempts exceeded',
          attemptCount,
          maxAttempts: quiz.maxAttempts,
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // Grade the quiz
    const result = gradeQuiz(quiz, answers)

    // Record the attempt
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.create({
      collection: 'quiz-attempts' as any,
      data: {
        user: user!.id,
        quiz: id,
        score: result.score,
        passed: result.passed,
        answers: answers.map((a) => ({
          questionIndex: a.questionIndex,
          answer: String(a.answer),
        })),
        completedAt: new Date().toISOString(),
      } as any,
    })

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
)
