import type { Payload, CollectionSlug } from 'payload'
import configPromise from '@payload-config'

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface QuizAttempt {
  id: string
  quizId: string
  /** Normalized student ID. In Payload this maps from the `user` relation field. */
  studentId: string
  score: number
  maxScore: number
  completedAt: Date
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  grade: number
  maxScore: number
  submittedAt: Date
}

export interface CourseRecord {
  id: string
  title: string
  quizWeight: number
  assignmentWeight: number
  instructorId: string
}

export interface EnrollmentRecord {
  id: string
  studentId: string
  courseId: string
  status: 'active' | 'completed' | 'dropped'
  enrolledAt: Date
}

export interface LessonCount {
  total: number
}

export interface ProgressResult {
  completedLessons: number
  totalLessons: number
  percentage: number
}

export interface StudentCourseGrade {
  courseId: string
  courseTitle: string
  quizAverage: number | null
  assignmentAverage: number | null
  overallGrade: number | null
  progress: ProgressResult
}

export interface StudentCourseGradeResult {
  studentId: string
  courseId: string
  courseTitle: string
  quizAverage: number | null
  assignmentAverage: number | null
  overallGrade: number | null
  progress: ProgressResult
}

// ─── GradebookService ─────────────────────────────────────────────────────────

export interface GradebookServiceDeps {
  getEnrollments: (studentId: string) => Promise<EnrollmentRecord[]>
  getCourse: (courseId: string) => Promise<CourseRecord | null>
  getQuizAttempts: (studentId: string, courseId: string) => Promise<QuizAttempt[]>
  getSubmissions: (studentId: string, courseId: string) => Promise<AssignmentSubmission[]>
  getCompletedLessons: (enrollmentId: string) => Promise<string[]>
  getTotalLessons: (courseId: string) => Promise<LessonCount>
}

export class GradebookService {
  constructor(private deps: GradebookServiceDeps) {}

  /**
   * Returns weighted grade summaries for every active enrollment of a student.
   */
  async getStudentGradebook(studentId: string): Promise<StudentCourseGrade[]> {
    const enrollments = await this.deps.getEnrollments(studentId)
    const active = enrollments.filter((e) => e.status === 'active')

    const results: StudentCourseGrade[] = []

    for (const enrollment of active) {
      const courseIdStr = enrollment.courseId

      const course = await this.deps.getCourse(courseIdStr)
      if (!course) continue

      const [quizAttempts, submissions] = await Promise.all([
        this.deps.getQuizAttempts(studentId, courseIdStr),
        this.deps.getSubmissions(studentId, courseIdStr),
      ])

      const quizAverage = this.getQuizAverage(quizAttempts)
      const assignmentAverage = this.getAssignmentAverage(submissions)
      const overallGrade = this.getOverallGrade(
        quizAverage,
        assignmentAverage,
        course.quizWeight,
        course.assignmentWeight,
      )

      const completedLessons = await this.deps.getCompletedLessons(enrollment.id)
      const { total } = await this.deps.getTotalLessons(courseIdStr)

      results.push({
        courseId: courseIdStr,
        courseTitle: course.title,
        quizAverage,
        assignmentAverage,
        overallGrade,
        progress: {
          completedLessons: completedLessons.length,
          totalLessons: total,
          percentage: total > 0 ? Math.round((completedLessons.length / total) * 100) : 0,
        },
      })
    }

    return results
  }

  /**
   * Returns grade summaries for every active student enrolled in a course.
   */
  async getCourseGradebook(
    courseId: string,
    _instructorId: string,
  ): Promise<StudentCourseGradeResult[]> {
    const course = await this.deps.getCourse(courseId)
    if (!course) return []

    const enrollments = await this.deps.getEnrollments(courseId)
    const active = enrollments.filter((e) => e.status === 'active')

    const results: StudentCourseGradeResult[] = []

    for (const enrollment of active) {
      const studentIdStr = enrollment.studentId

      const [quizAttempts, submissions] = await Promise.all([
        this.deps.getQuizAttempts(studentIdStr, courseId),
        this.deps.getSubmissions(studentIdStr, courseId),
      ])

      const quizAverage = this.getQuizAverage(quizAttempts)
      const assignmentAverage = this.getAssignmentAverage(submissions)
      const overallGrade = this.getOverallGrade(
        quizAverage,
        assignmentAverage,
        course.quizWeight,
        course.assignmentWeight,
      )

      const completedLessons = await this.deps.getCompletedLessons(enrollment.id)
      const { total } = await this.deps.getTotalLessons(courseId)

      results.push({
        studentId: studentIdStr,
        courseId,
        courseTitle: course.title,
        quizAverage,
        assignmentAverage,
        overallGrade,
        progress: {
          completedLessons: completedLessons.length,
          totalLessons: total,
          percentage: total > 0 ? Math.round((completedLessons.length / total) * 100) : 0,
        },
      })
    }

    return results
  }

  /** Average percentage across best quiz attempts per quiz. */
  getQuizAverage(attempts: QuizAttempt[]): number | null {
    if (attempts.length === 0) return null

    const bestPerQuiz = new Map<string, number>()
    for (const attempt of attempts) {
      const pct = attempt.maxScore > 0 ? (attempt.score / attempt.maxScore) * 100 : 0
      const existing = bestPerQuiz.get(attempt.quizId) ?? -1
      if (pct > existing) bestPerQuiz.set(attempt.quizId, pct)
    }

    const percentages = [...bestPerQuiz.values()]
    if (percentages.length === 0) return null
    return Math.round((percentages.reduce((a, b) => a + b, 0) / percentages.length) * 100) / 100
  }

  /** Average percentage across graded assignment submissions. */
  getAssignmentAverage(submissions: AssignmentSubmission[]): number | null {
    const graded = submissions.filter((s) => s.grade !== null && s.grade !== undefined)
    if (graded.length === 0) return null

    const total = graded.reduce((sum, s) => {
      const pct = s.maxScore > 0 ? (s.grade / s.maxScore) * 100 : 0
      return sum + pct
    }, 0)

    return Math.round((total / graded.length) * 100) / 100
  }

  /**
   * Weighted average of quiz and assignment averages.
   * Returns null if either component is null.
   */
  getOverallGrade(
    quizAvg: number | null,
    assignmentAvg: number | null,
    quizWeight: number,
    assignmentWeight: number,
  ): number | null {
    if (quizAvg === null || assignmentAvg === null) return null
    const totalWeight = quizWeight + assignmentWeight
    const grade = (quizAvg * quizWeight + assignmentAvg * assignmentWeight) / totalWeight
    return Math.round(grade * 100) / 100
  }
}

// ─── Payload CMS adapter ──────────────────────────────────────────────────────

interface PayloadQuizAttempt {
  id: string
  user: string | { id: string }
  quiz: string
  courseId: string
  score: number
  completedAt: string
}

interface PayloadSubmission {
  id: string
  student: string | { id: string }
  assignment: string | { id: string }
  courseId: string
  grade: number | null
  maxScore: number
  submittedAt: string
}

interface PayloadCourse {
  id: string
  title: string
  quizWeight: number
  assignmentWeight: number
  instructor: string | { id: string }
}

interface PayloadEnrollment {
  id: string
  student: string | { id: string }
  course: string | { id: string }
  status: string
  enrolledAt: string
  completedLessons?: (string | { id: string })[]
}

function normalizeId(value: string | { id: string }): string {
  return typeof value === 'string' ? value : value.id
}

export class PayloadGradebookService {
  constructor(private payload: Payload) {}

  private async getEnrollmentsByStudent(studentId: string): Promise<EnrollmentRecord[]> {
    const result = await this.payload.find({
      collection: 'enrollments' as CollectionSlug,
      where: { student: { equals: studentId }, status: { equals: 'active' } },
      limit: 100,
    })
    return result.docs as unknown as EnrollmentRecord[]
  }

  private async getEnrollmentsByCourse(courseId: string): Promise<EnrollmentRecord[]> {
    const result = await this.payload.find({
      collection: 'enrollments' as CollectionSlug,
      where: { course: { equals: courseId }, status: { equals: 'active' } },
      limit: 100,
    })
    return result.docs as unknown as EnrollmentRecord[]
  }

  private async getCourseRecord(courseId: string): Promise<CourseRecord | null> {
    const doc = (await this.payload.findByID({
      collection: 'courses' as CollectionSlug,
      id: courseId,
    })) as unknown as PayloadCourse

    if (!doc) return null

    return {
      id: doc.id,
      title: doc.title,
      quizWeight: doc.quizWeight ?? 40,
      assignmentWeight: doc.assignmentWeight ?? 60,
      instructorId: normalizeId(doc.instructor),
    }
  }

  private async getQuizAttemptsByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<QuizAttempt[]> {
    const result = await this.payload.find({
      collection: 'quiz-attempts' as CollectionSlug,
      where: {
        user: { equals: studentId },
        courseId: { equals: courseId },
      },
      limit: 1000,
    })

    return (result.docs as unknown as PayloadQuizAttempt[]).map((a) => ({
      id: a.id,
      quizId: a.quiz,
      studentId: normalizeId(a.user),
      score: a.score,
      maxScore: 100,
      completedAt: new Date(a.completedAt),
    }))
  }

  private async getSubmissionsByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<AssignmentSubmission[]> {
    const result = await this.payload.find({
      collection: 'submissions' as CollectionSlug,
      where: {
        student: { equals: studentId },
        courseId: { equals: courseId },
      },
      depth: 0,
      limit: 1000,
    })

    return (result.docs as unknown as PayloadSubmission[])
      .filter((s) => s.grade !== null)
      .map((s) => ({
        id: s.id,
        assignmentId: normalizeId(s.assignment),
        studentId: normalizeId(s.student),
        grade: s.grade ?? 0,
        maxScore: s.maxScore,
        submittedAt: new Date(s.submittedAt),
      }))
  }

  private async getCompletedLessonIds(enrollmentId: string): Promise<string[]> {
    const doc = (await this.payload.findByID({
      collection: 'enrollments' as CollectionSlug,
      id: enrollmentId,
    })) as unknown as PayloadEnrollment

    return (doc.completedLessons ?? []).map(normalizeId)
  }

  private async getTotalLessonsForCourse(courseId: string): Promise<LessonCount> {
    const { totalDocs } = await this.payload.find({
      collection: 'lessons' as CollectionSlug,
      where: { course: { equals: courseId } },
      limit: 0,
    })
    return { total: totalDocs }
  }

  getService(): GradebookService {
    const service = new GradebookService({
      getEnrollments: (studentId) => this.getEnrollmentsByStudent(studentId),
      getCourse: (courseId) => this.getCourseRecord(courseId),
      getQuizAttempts: (studentId, courseId) =>
        this.getQuizAttemptsByStudentAndCourse(studentId, courseId),
      getSubmissions: (studentId, courseId) =>
        this.getSubmissionsByStudentAndCourse(studentId, courseId),
      getCompletedLessons: (enrollmentId) => this.getCompletedLessonIds(enrollmentId),
      getTotalLessons: (courseId) => this.getTotalLessonsForCourse(courseId),
    })
    return service
  }
}

/** Factory: builds a GradebookService backed by the real Payload instance. */
export async function getGradebookService(): Promise<GradebookService> {
  const payload = await import('payload').then((m) => m.getPayload({ config: configPromise }))
  return new PayloadGradebookService(payload as unknown as Payload).getService()
}
