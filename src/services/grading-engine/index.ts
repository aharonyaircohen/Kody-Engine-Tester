/**
 * GradingEngine - Unified grading subsystem.
 *
 * Composes:
 * - Pure grade calculation (quiz averages, assignment averages, overall grades)
 * - Quiz grading (multiple-choice, true-false, short-answer)
 * - Assignment grading (rubric-based)
 * - Payload persistence for grades and attempts
 *
 * Behavior is preserved from the original four-file design:
 * - gradebook.ts: GradebookService (quiz/assignment aggregation)
 * - grading.ts: GradingService (rubric-based assignment grading)
 * - quiz-grader.ts: Pure quiz grading functions
 * - gradebook-payload.ts: PayloadGradebookService (persistence)
 */

import type { Payload, CollectionSlug } from 'payload'
import type {
  StudentGradebookEntry,
  CourseGradebookEntry,
  CourseEnrollmentRef,
  Quiz,
  QuizAnswer,
  GradeOutput,
  GradingResult,
  AttemptCheck,
  RubricCriterion,
  RubricScore,
  GradingServiceResult,
  Grader,
  GradeSubmissionOptions,
  GradebookServiceDeps,
  GradingServiceDeps,
} from './types'

// Re-export types for external use
export type {
  StudentGradebookEntry,
  CourseGradebookEntry,
  CourseEnrollmentRef,
  Quiz,
  QuizAnswer,
  GradeOutput,
  GradingResult,
  AttemptCheck,
  RubricCriterion,
  RubricScore,
  GradingServiceResult,
  Grader,
  GradeSubmissionOptions,
  GradebookServiceDeps,
  GradingServiceDeps,
}

// ─── In-Memory Attempt Tracking ────────────────────────────────────────────────

const attemptCounts = new Map<string, number>()

function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase()
}

// ─── Quiz Grading (Pure Functions) ────────────────────────────────────────────

function gradeQuestion(
  questionIndex: number,
  question: { text: string; type: 'multiple-choice' | 'true-false' | 'short-answer'; options: { text: string; isCorrect: boolean }[]; correctAnswer?: string; points: number },
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
    const selected = question.options.find((opt) => opt.text === answer)
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

// ─── Grade Calculation (Pure Functions) ──────────────────────────────────────

function num(val: number | null | undefined): number {
  return val ?? 0
}

function calculateQuizAverage(
  bestPercents: number[],
): number {
  if (bestPercents.length === 0) return 0
  return bestPercents.reduce((sum, p) => sum + p, 0) / bestPercents.length
}

function calculateOverallGrade(
  quizAverage: number,
  assignmentAverage: number,
  quizWeight: number,
  assignmentWeight: number,
): number {
  return Math.round(
    (quizWeight / 100) * quizAverage + (assignmentWeight / 100) * assignmentAverage,
  )
}

// ─── Gradebook Service ────────────────────────────────────────────────────────

export class GradebookCalculator<
  TCourse,
  TQuiz,
  TQuizAttempt,
  TAssignment,
  TSubmission,
  TEnrollment,
  TLesson,
  TCompletedLesson,
> {
  constructor(
    private deps: GradebookServiceDeps<TCourse, TQuiz, TQuizAttempt, TAssignment, TSubmission, TEnrollment, TLesson, TCompletedLesson>,
  ) {}

  async getStudentGradebook(studentId: string): Promise<StudentGradebookEntry[]> {
    const enrollments = await this.deps.getEnrollments(studentId)

    const entries: StudentGradebookEntry[] = []

    for (const enrollment of enrollments) {
      const enrollmentRecord = enrollment as unknown as { courseId?: string; course?: string | { id: string }; id: string }
      const courseId =
        enrollmentRecord.courseId ??
        (typeof enrollmentRecord.course === 'string'
          ? enrollmentRecord.course
          : enrollmentRecord.course?.id)
      if (!courseId) continue

      const course = await this.deps.getCourse(courseId)
      if (!course) continue

      const courseRecord = course as unknown as { title?: string; quizWeight?: number; assignmentWeight?: number }
      const quizWeight = num(courseRecord.quizWeight) || 40
      const assignmentWeight = num(courseRecord.assignmentWeight) || 60

      const [quizAverage, assignmentAverage, progress] = await Promise.all([
        this.getQuizAverage(studentId, courseId),
        this.getAssignmentAverage(studentId, courseId),
        this.getProgress(enrollmentRecord.id, courseId),
      ])

      const overallGrade = calculateOverallGrade(quizAverage, assignmentAverage, quizWeight, assignmentWeight)

      entries.push({
        courseId,
        courseTitle: courseRecord.title ?? courseId,
        quizAverage: Math.round(quizAverage * 10) / 10,
        assignmentAverage: Math.round(assignmentAverage * 10) / 10,
        overallGrade,
        quizWeight,
        assignmentWeight,
        progress,
      })
    }

    return entries
  }

  async getCourseGradebook(courseId: string): Promise<CourseGradebookEntry[]> {
    const course = await this.deps.getCourse(courseId)
    if (!course) return []

    const courseRecord = course as unknown as { quizWeight?: number; assignmentWeight?: number }
    const quizWeight = num(courseRecord.quizWeight) || 40
    const assignmentWeight = num(courseRecord.assignmentWeight) || 60

    const courseEnrollments = await this.deps.getCourseEnrollments(courseId)

    const entries: CourseGradebookEntry[] = []

    for (const enrollment of courseEnrollments) {
      const studentId = enrollment.studentId
      if (!studentId) continue

      const [quizAverage, assignmentAverage] = await Promise.all([
        this.getQuizAverage(studentId, courseId),
        this.getAssignmentAverage(studentId, courseId),
      ])

      const overallGrade = calculateOverallGrade(quizAverage, assignmentAverage, quizWeight, assignmentWeight)

      entries.push({
        studentId,
        quizAverage: Math.round(quizAverage * 10) / 10,
        assignmentAverage: Math.round(assignmentAverage * 10) / 10,
        overallGrade,
        quizWeight,
        assignmentWeight,
      })
    }

    return entries
  }

  private async getQuizAverage(studentId: string, courseId: string): Promise<number> {
    const quizzes = await this.deps.getQuizzes(courseId)
    if (quizzes.length === 0) return 0

    const bestPercents: number[] = []

    for (const quiz of quizzes) {
      const quizRecord = quiz as unknown as { maxScore?: number }
      const maxScore = num(quizRecord.maxScore) || 100
      const attempts = await this.deps.getQuizAttempts(studentId, (quiz as unknown as { id: string }).id)
      if (attempts.length === 0) continue

      const best = attempts.reduce((best, current) => {
        const bestRecord = best as unknown as { score: number; maxScore: number }
        const currentRecord = current as unknown as { score: number; maxScore: number }
        const bestPct = (bestRecord.score / (bestRecord.maxScore || 1)) * 100
        const currPct = (currentRecord.score / (currentRecord.maxScore || 1)) * 100
        return currPct > bestPct ? current : best
      })
      const bestRecord = best as unknown as { score: number; maxScore: number }
      bestPercents.push((bestRecord.score / (bestRecord.maxScore || 1)) * 100)
    }

    return calculateQuizAverage(bestPercents)
  }

  private async getAssignmentAverage(studentId: string, courseId: string): Promise<number> {
    const assignments = await this.deps.getAssignments(courseId)
    if (assignments.length === 0) return 0

    const gradedPercents: number[] = []

    for (const assignment of assignments) {
      const assignmentRecord = assignment as unknown as { maxScore?: number; id: string }
      const maxScore = num(assignmentRecord.maxScore) || 100
      const submissions = await this.deps.getSubmissions(studentId, assignmentRecord.id)
      const graded = submissions.find((s) => (s as unknown as { grade: number | null }).grade !== null)
      if (!graded) continue
      const gradedRecord = graded as unknown as { grade: number | null }
      gradedPercents.push(((gradedRecord.grade ?? 0) / maxScore) * 100)
    }

    if (gradedPercents.length === 0) return 0
    return gradedPercents.reduce((sum, p) => sum + p, 0) / gradedPercents.length
  }

  private async getProgress(enrollmentId: string, courseId: string): Promise<number> {
    const lessons = await this.deps.getLessons(courseId)
    if (lessons.length === 0) return 0

    const completed = await this.deps.getCompletedLessons(enrollmentId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completedIds = new Set(completed.map((c) => (c as any).lessonId))
    const completedCount = lessons.filter((l) => completedIds.has((l as unknown as { id: string }).id)).length

    return Math.round((completedCount / lessons.length) * 100)
  }
}

// ─── Assignment Grading Service ───────────────────────────────────────────────

export class AssignmentGrader<
  A extends { id: string; maxScore: number; dueDate?: Date; rubric: RubricCriterion[] },
  S extends { id: string; assignmentId: string; studentId: string; submittedAt: Date },
  C extends { id: string; instructorIds: string[] },
> {
  constructor(private deps: GradingServiceDeps<A, S, C>) {}

  async canGrade(grader: Grader, submissionId: string): Promise<boolean> {
    if (grader.role === 'admin') return true
    if (grader.role !== 'instructor') return false

    const submission = await this.deps.getSubmission(submissionId)
    if (!submission) return false

    const course = await this.deps.getCourseForAssignment(submission.assignmentId)
    if (!course) return false

    return course.instructorIds.includes(grader.id)
  }

  async gradeSubmission(options: GradeSubmissionOptions): Promise<GradingServiceResult<S>> {
    const { submissionId, rubricScores, grader, feedback } = options

    const submission = await this.deps.getSubmission(submissionId)
    if (!submission) {
      return { success: false, error: `Submission "${submissionId}" not found.` }
    }

    if (grader.role === 'student') {
      return { success: false, error: 'Students are not authorized to grade submissions.' }
    }

    const assignment = await this.deps.getAssignment(submission.assignmentId)
    if (!assignment) {
      return { success: false, error: `Assignment for submission "${submissionId}" not found.` }
    }

    const course = await this.deps.getCourseForAssignment(submission.assignmentId)
    if (!course) {
      return { success: false, error: 'Course not found — not authorized to grade this submission.' }
    }

    const isInstructor = grader.role === 'instructor'
    if (isInstructor && !course.instructorIds.includes(grader.id)) {
      return { success: false, error: 'You are not authorized to grade submissions for this course.' }
    }

    const current = await this.deps.getSubmission(submissionId)
    if (current && (current as unknown as { status?: string }).status === 'graded') {
      return { success: false, error: 'This submission has already been graded.' }
    }

    const rubricMap = new Map<string, RubricCriterion>()
    for (const item of assignment.rubric) {
      rubricMap.set(item.criterion, item)
    }

    const scoredCriteria = new Set<string>()
    for (const rs of rubricScores) {
      if (scoredCriteria.has(rs.criterion)) {
        return {
          success: false,
          error: `Duplicate criterion "${rs.criterion}" in rubricScores. Each criterion may appear only once.`,
        }
      }
      scoredCriteria.add(rs.criterion)
    }

    for (const rs of rubricScores) {
      if (!rubricMap.has(rs.criterion)) {
        return {
          success: false,
          error: `Criterion "${rs.criterion}" not found in assignment rubric.`,
        }
      }
    }

    const missingCriteria = [...rubricMap.keys()].filter((c) => !scoredCriteria.has(c))
    if (missingCriteria.length > 0) {
      return {
        success: false,
        error: `Missing scores for rubric criteria: ${missingCriteria.join(', ')}.`,
      }
    }

    let totalScore = 0
    for (const rs of rubricScores) {
      if (rs.score < 0) {
        return {
          success: false,
          error: `Score for "${rs.criterion}" cannot be negative (got ${rs.score}).`,
        }
      }

      const criterion = rubricMap.get(rs.criterion)!
      if (rs.score > criterion.maxPoints) {
        return {
          success: false,
          error: `Score for "${rs.criterion}" (${rs.score}) exceeds maxPoints (${criterion.maxPoints}).`,
        }
      }

      totalScore += rs.score
    }

    if (totalScore > assignment.maxScore) {
      return {
        success: false,
        error: `Total score (${totalScore}) exceeds assignment maxScore (${assignment.maxScore}).`,
      }
    }

    const isLate = !!assignment.dueDate && submission.submittedAt > assignment.dueDate

    const updated = await this.deps.updateSubmission(submissionId, {
      grade: totalScore,
      status: 'graded',
      feedback,
      rubricScores,
    } as Partial<S & { grade: number; status: string; feedback?: string; rubricScores: RubricScore[] }>)

    if (!updated) {
      return { success: false, error: 'Failed to update submission.' }
    }

    return {
      success: true,
      submission: updated as S & { grade: number; status: string; feedback?: string; rubricScores: RubricScore[]; submittedAt: Date; assignmentId: string },
      isLate,
    }
  }
}

// ─── Payload-Backed Gradebook Service ─────────────────────────────────────────

interface PayloadCourse {
  id: string
  title?: string
  quizWeight?: number
  assignmentWeight?: number
  instructor?: { id: string } | string
}

interface PayloadQuiz {
  id: string
  course?: { id: string } | string
}

interface PayloadQuizAttempt {
  id: string
  user?: { id: string } | string
  quiz?: { id: string } | string
  score: number
  maxScore?: number
}

interface PayloadSubmission {
  id: string
  student?: { id: string } | string
  assignment?: { id: string } | string
  grade: number | null
}

interface PayloadEnrollment {
  id: string
  student?: { id: string } | string
  course?: { id: string } | string
  status?: string
}

interface PayloadLesson {
  id: string
  course?: { id: string } | string
}

interface PayloadCompletedLesson {
  enrollmentId: string
  lessonId: string
}

function normalizeId(val: string | { id: string } | undefined): string {
  if (!val) return ''
  return typeof val === 'string' ? val : val.id
}

export class PayloadGradebookCalculator {
  private calc: GradebookCalculator<
    PayloadCourse,
    PayloadQuiz,
    PayloadQuizAttempt,
    { id: string; maxScore?: number },
    PayloadSubmission,
    PayloadEnrollment,
    PayloadLesson,
    PayloadCompletedLesson
  >

  constructor(private payload: Payload) {
    this.calc = new GradebookCalculator({
      getCourse: async (id: string) => {
        return this.payload.findByID({
          collection: 'courses' as CollectionSlug,
          id,
          depth: 0,
        }) as unknown as Promise<PayloadCourse>
      },
      getQuizzes: async (courseId: string) => {
        const { docs } = await this.payload.find({
          collection: 'quizzes' as CollectionSlug,
          where: { course: { equals: courseId } },
          limit: 0,
          depth: 0,
        })
        return docs as unknown as PayloadQuiz[]
      },
      getQuizAttempts: async (studentId: string, quizId: string) => {
        const { docs } = await this.payload.find({
          collection: 'quiz-attempts' as CollectionSlug,
          where: {
            user: { equals: studentId },
            quiz: { equals: quizId },
          },
          limit: 100,
          depth: 0,
        })
        return docs as unknown as PayloadQuizAttempt[]
      },
      getAssignments: async (courseId: string) => {
        const { docs } = await this.payload.find({
          collection: 'assignments' as CollectionSlug,
          where: { course: { equals: courseId } },
          limit: 0,
          depth: 0,
        })
        return docs as unknown as { id: string; maxScore?: number }[]
      },
      getSubmissions: async (studentId: string, assignmentId: string) => {
        const { docs } = await this.payload.find({
          collection: 'submissions' as CollectionSlug,
          where: {
            student: { equals: studentId },
            assignment: { equals: assignmentId },
          },
          sort: '-submittedAt',
          limit: 10,
          depth: 0,
        })
        return docs as unknown as PayloadSubmission[]
      },
      getEnrollments: async (studentId: string) => {
        const { docs } = await this.payload.find({
          collection: 'enrollments' as CollectionSlug,
          where: {
            student: { equals: studentId },
            status: { equals: 'active' },
          },
          limit: 100,
          depth: 0,
        })
        return docs as unknown as PayloadEnrollment[]
      },
      getCourseEnrollments: async (courseId: string) => {
        const { docs } = await this.payload.find({
          collection: 'enrollments' as CollectionSlug,
          where: {
            course: { equals: courseId },
            status: { equals: 'active' },
          },
          limit: 100,
          depth: 0,
        })
        return (docs as unknown as PayloadEnrollment[]).map((e) => ({
          enrollmentId: e.id,
          studentId: normalizeId(e.student),
        }))
      },
      getLessons: async (courseId: string) => {
        const { docs } = await this.payload.find({
          collection: 'lessons' as CollectionSlug,
          where: { course: { equals: courseId } },
          limit: 0,
          depth: 0,
        })
        return docs as unknown as PayloadLesson[]
      },
      getCompletedLessons: async (enrollmentId: string) => {
        const enrollment = (await this.payload.findByID({
          collection: 'enrollments' as CollectionSlug,
          id: enrollmentId,
          depth: 0,
        })) as unknown as { completedLessons?: (string | { id: string })[] }
        const raw = enrollment.completedLessons ?? []
        return raw.map((id) => ({
          enrollmentId,
          lessonId: normalizeId(id),
        }))
      },
    })
  }

  async getStudentGradebook(studentId: string): Promise<StudentGradebookEntry[]> {
    return this.calc.getStudentGradebook(studentId)
  }

  async getCourseGradebook(courseId: string): Promise<CourseGradebookEntry[]> {
    return this.calc.getCourseGradebook(courseId)
  }
}

// ─── Unified GradingEngine ────────────────────────────────────────────────────

export interface GradingEngineDeps {
  payload: Payload
}

/**
 * Unified GradingEngine - single entry point for all grading operations.
 *
 * Combines:
 * - Quiz grading (pure)
 * - Assignment grading (rubric-based)
 * - Gradebook aggregation (student/course grades)
 * - Payload persistence
 *
 * Preserves behavior from the original four-file design while providing
 * a clean, cohesive API.
 */
export class GradingEngine {
  private gradebookCalc: PayloadGradebookCalculator

  constructor(private deps: GradingEngineDeps) {
    this.gradebookCalc = new PayloadGradebookCalculator(deps.payload)
  }

  // ─── Quiz Grading ───────────────────────────────────────────────────────────

  /**
   * Grade a quiz with the given answers.
   * Pure function - does not persist anything.
   */
  gradeQuiz(quiz: Quiz, answers: QuizAnswer[]): GradeOutput {
    return gradeQuiz(quiz, answers)
  }

  /**
   * Check and record a quiz attempt for a user.
   */
  checkQuizAttempts(userId: string, quizId: string, maxAttempts?: number): AttemptCheck {
    return checkAttempts(userId, quizId, maxAttempts)
  }

  /**
   * Get current attempt count for a user+quiz.
   */
  getQuizAttemptCount(userId: string, quizId: string): number {
    return getAttempts(userId, quizId)
  }

  /**
   * Record a completed quiz attempt in Payload.
   */
  async recordQuizAttempt(
    userId: string,
    quizId: string,
    result: GradeOutput,
    answers: QuizAnswer[],
  ): Promise<void> {
    await this.deps.payload.create({
      collection: 'quiz-attempts' as CollectionSlug,
      data: {
        user: userId,
        quiz: quizId,
        score: result.score,
        passed: result.passed,
        answers: answers.map((a) => ({
          questionIndex: a.questionIndex,
          answer: String(a.answer),
        })),
        completedAt: new Date().toISOString(),
      } as unknown as Record<string, unknown>,
    })
  }

  /**
   * Get quiz attempts for a user.
   */
  async getQuizAttempts(userId: string, quizId: string) {
    const attempts = await this.deps.payload.find({
      collection: 'quiz-attempts' as CollectionSlug,
      where: {
        user: { equals: userId },
        quiz: { equals: quizId },
      },
      sort: '-completedAt',
      limit: 100,
    })

    return {
      attempts: attempts.docs.map((doc: unknown) => {
        const d = doc as { id: string; score: number; passed: boolean; answers: unknown; completedAt: string }
        return {
          id: d.id,
          score: d.score,
          passed: d.passed,
          answers: d.answers,
          completedAt: d.completedAt,
        }
      }),
      total: attempts.totalDocs,
    }
  }

  // ─── Gradebook ──────────────────────────────────────────────────────────────

  /**
   * Get gradebook entries for a student across all enrolled courses.
   */
  async getStudentGradebook(studentId: string): Promise<StudentGradebookEntry[]> {
    return this.gradebookCalc.getStudentGradebook(studentId)
  }

  /**
   * Get gradebook entries for all students in a course.
   */
  async getCourseGradebook(courseId: string): Promise<CourseGradebookEntry[]> {
    return this.gradebookCalc.getCourseGradebook(courseId)
  }
}
