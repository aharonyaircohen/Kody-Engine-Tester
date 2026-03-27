export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer'

export interface QuestionOption {
  text: string
  isCorrect: boolean
}

export interface QuizQuestion {
  text: string
  type: QuestionType
  options: QuestionOption[]
  correctAnswer?: string
  points: number
}

export interface Quiz {
  id: string
  title: string
  passingScore: number
  maxAttempts: number
  questions: QuizQuestion[]
}

export interface QuizAnswer {
  questionIndex: number
  answer: string | number
}

export interface GradingResult {
  questionIndex: number
  questionText: string
  correct: boolean
  pointsEarned: number
  correctAnswer?: string
  userAnswer?: string
}

export interface GradeOutput {
  score: number
  passed: boolean
  results: GradingResult[]
  totalPoints: number
  earnedPoints: number
}

// In-memory attempt tracking store
// Key: `${userId}-${quizId}`
const attemptCounts = new Map<string, number>()

function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase()
}

function gradeQuestion(
  questionIndex: number,
  question: QuizQuestion,
  submittedAnswer: QuizAnswer | undefined,
): GradingResult {
  if (!submittedAnswer) {
    return {
      questionIndex,
      questionText: question.text,
      correct: false,
      pointsEarned: 0,
    }
  }

  const { answer } = submittedAnswer
  let correct = false

  if (question.type === 'multiple-choice') {
    const selected = question.options.find(
      (opt) => opt.text === answer,
    )
    correct = selected?.isCorrect ?? false
  } else if (question.type === 'true-false') {
    correct = normalizeAnswer(String(answer)) === question.correctAnswer?.toLowerCase()
  } else if (question.type === 'short-answer') {
    correct = normalizeAnswer(String(answer)) === question.correctAnswer?.toLowerCase()
  }

  return {
    questionIndex,
    questionText: question.text,
    correct,
    pointsEarned: correct ? question.points : 0,
    correctAnswer: question.correctAnswer ?? question.options.find((o) => o.isCorrect)?.text,
    userAnswer: String(answer),
  }
}

export function gradeQuiz(quiz: Quiz, answers: QuizAnswer[]): GradeOutput {
  const answerMap = new Map(answers.map((a) => [a.questionIndex, a]))

  const results: GradingResult[] = quiz.questions.map((question, index) => {
    return gradeQuestion(index, question, answerMap.get(index))
  })

  const earnedPoints = results.reduce((sum, r) => sum + r.pointsEarned, 0)
  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0)
  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 10000) / 100 : 0
  const passed = score >= quiz.passingScore

  return { score, passed, results, totalPoints, earnedPoints }
}

export interface AttemptCheck {
  count: number
  exceeded: boolean
}

export function getAttempts(userId: string, quizId: string): number {
  const key = `${userId}-${quizId}`
  return attemptCounts.get(key) ?? 0
}

export function resetAttempts(userId: string, quizId: string): void {
  attemptCounts.delete(`${userId}-${quizId}`)
}

export function resetAllAttempts(): void {
  attemptCounts.clear()
}

/**
 * Records an attempt for user+quiz and returns current count + exceeded flag.
 * Call once per submission to increment the count.
 * @param maxAttempts - optional max allowed attempts; exceeded=true if count > maxAttempts
 */
export function checkAttempts(
  userId: string,
  quizId: string,
  maxAttempts?: number,
): AttemptCheck {
  const key = `${userId}-${quizId}`
  const count = (attemptCounts.get(key) ?? 0) + 1
  attemptCounts.set(key, count)
  return {
    count,
    exceeded: maxAttempts !== undefined ? count >= maxAttempts : false,
  }
}


