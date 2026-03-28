import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'
import { gradeQuiz, type Quiz, type QuizAnswer } from '../../../../../services/quiz-grader'
import { createErrorResponse, createJsonResponse } from '../../../../../utils/api-response'

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params

  let body: { userId: string; answers: QuizAnswer[] }
  try {
    body = await request.json()
  } catch {
    return createErrorResponse('Invalid JSON body', 400)
  }

  const { userId, answers } = body

  if (!userId || !Array.isArray(answers)) {
    return createErrorResponse('userId and answers are required', 400)
  }

  const payload = await getPayload({ config: configPromise })

  // Fetch the quiz from Payload
  const quizDoc = await payload.findByID({
    collection: 'quizzes' as any,
    id,
    depth: 0,
  }) as any

  if (!quizDoc) {
    return createErrorResponse('Quiz not found', 404)
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
      user: { equals: userId },
      quiz: { equals: id },
    },
    limit: 0,
  })
  const attemptCount = existingAttempts.totalDocs

  if (attemptCount >= quiz.maxAttempts) {
    return createErrorResponse(
      `Maximum attempts exceeded: ${attemptCount}/${quiz.maxAttempts}`,
      403,
    )
  }

  // Grade the quiz
  const result = gradeQuiz(quiz, answers)

  // Record the attempt
  await payload.create({
    collection: 'quiz-attempts' as any,
    data: {
      user: userId,
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

  return createJsonResponse(result)
}
