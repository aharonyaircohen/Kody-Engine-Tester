import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'
import { gradeQuiz, type Quiz, type QuizAnswer } from '@/services/quiz-grader'
import { withAuth } from '@/auth/withAuth'

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
    const quizDoc = await payload.findByID({
      collection: 'quizzes' as any,
      id,
      depth: 0,
    }) as any

    if (!quizDoc) {
      return new Response(JSON.stringify({ error: 'Quiz not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Convert Payload quiz doc to internal Quiz format
    const quiz: Quiz = {
      id: quizDoc.id as string,
      title: quizDoc.title as string,
      passingScore: (quizDoc.passingScore as number) ?? 70,
      maxAttempts: (quizDoc.maxAttempts as number) ?? 3,
      questions: ((quizDoc.questions as any[]) ?? []).map((q) => ({
        text: q.text as string,
        type: q.type as 'multiple-choice' | 'true-false' | 'short-answer',
        options: ((q.options as any[]) ?? []).map((o) => ({
          text: o.text as string,
          isCorrect: o.isCorrect as boolean,
        })),
        correctAnswer: q.correctAnswer as string | undefined,
        points: (q.points as number) ?? 1,
      })),
    }

    // Check attempt count
    const existingAttempts = await payload.find({
      collection: 'quiz-attempts' as any,
      where: {
        user: { equals: user.id },
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
    await payload.create({
      collection: 'quiz-attempts' as any,
      data: {
        user: user.id,
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
