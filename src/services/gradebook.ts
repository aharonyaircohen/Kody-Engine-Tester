// ─── Domain types ───────────────────────────────────────────────────────────────

export interface QuizGrade {
  quizId: string
  score: number // percentage 0-100
  maxScore: number
  percentage: number
  passed: boolean
  completedAt: Date
}

export interface AssignmentGrade {
  submissionId: string
  assignmentId: string
  grade: number
  maxScore: number
  percentage: number
  submittedAt: Date
}

export interface CourseGradebook {
  courseId: string
  courseTitle: string
  quizWeight: number
  assignmentWeight: number
  quizAverage: number | null // null if no quizzes
  assignmentAverage: number | null // null if no assignments
  overallGrade: number | null // null if no grades
  quizGrades: QuizGrade[]
  assignmentGrades: AssignmentGrade[]
  completedItems: number
  totalItems: number
  progress: number // percentage of graded items
}

export interface StudentGradebook {
  studentId: string
  courses: CourseGradebook[]
  overallAverage: number | null
  totalCourses: number
  activeCourses: number
  completedCourses: number
}

// ─── GradebookService (generic, Payload-agnostic) ──────────────────────────────

export interface GradebookDeps {
  getEnrollmentsForStudent: (studentId: string) => Promise<Array<{ id: string; courseId: string; status: string }>>
  getEnrollmentsForCourse: (courseId: string) => Promise<Array<{ id: string; studentId: string; status: string }>>
  getCourse: (courseId: string) => Promise<{
    id: string
    title: string
    quizWeight: number
    assignmentWeight: number
    moduleIds: string[]
  } | null>
  getQuizzesForModules: (moduleIds: string[]) => Promise<Array<{ id: string; moduleId: string; maxScore: number }>>
  getQuizAttemptsForStudent: (studentId: string, quizIds: string[]) => Promise<QuizGrade[]>
  getSubmissionsForStudent: (studentId: string, assignmentIds: string[]) => Promise<AssignmentGrade[]>
}

export class GradebookService {
  constructor(private deps: GradebookDeps) {}

  /**
   * Returns the full gradebook for a single student across all enrolled courses.
   */
  async getStudentGradebook(studentId: string): Promise<StudentGradebook> {
    const enrollments = await this.deps.getEnrollmentsForStudent(studentId)

    const courseGradebooks: CourseGradebook[] = []
    let activeCourses = 0
    let completedCourses = 0

    for (const enrollment of enrollments) {
      const course = await this.deps.getCourse(enrollment.courseId)
      if (!course) continue

      if (enrollment.status === 'active') activeCourses++
      if (enrollment.status === 'completed') completedCourses++

      const courseGradebook = await this.buildCourseGradebook(course, studentId)
      courseGradebooks.push(courseGradebook)
    }

    const gradedCourses = courseGradebooks.filter((cg) => cg.overallGrade !== null)
    const overallAverage =
      gradedCourses.length > 0
        ? Math.round(
            (gradedCourses.reduce((sum, cg) => sum + (cg.overallGrade ?? 0), 0) / gradedCourses.length) * 100,
          ) / 100
        : null

    return {
      studentId,
      courses: courseGradebooks,
      overallAverage,
      totalCourses: courseGradebooks.length,
      activeCourses,
      completedCourses,
    }
  }

  /**
   * Returns the gradebook for all students enrolled in a course.
   */
  async getCourseGradebook(courseId: string): Promise<Array<{ studentId: string } & CourseGradebook>> {
    const course = await this.deps.getCourse(courseId)
    if (!course) return []

    const enrollments = await this.deps.getEnrollmentsForCourse(courseId)
    const results: Array<{ studentId: string } & CourseGradebook> = []

    for (const enrollment of enrollments) {
      const studentCourseGradebook = await this.buildCourseGradebook(course, enrollment.studentId)
      results.push({
        studentId: enrollment.studentId,
        ...studentCourseGradebook,
      })
    }

    return results
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private async buildCourseGradebook(
    course: { id: string; title: string; quizWeight: number; assignmentWeight: number; moduleIds: string[] },
    studentId?: string,
  ): Promise<CourseGradebook> {
    const quizzes = await this.deps.getQuizzesForModules(course.moduleIds)
    const quizIds = quizzes.map((q) => q.id)

    const [quizGrades, submissions] = await Promise.all([
      studentId ? this.deps.getQuizAttemptsForStudent(studentId, quizIds) : Promise.resolve([]),
      studentId
        ? this.deps.getSubmissionsForStudent(
            studentId,
            quizzes.map((q) => q.id), // assignments are keyed by quiz IDs in mock, real impl uses assignment IDs
          )
        : Promise.resolve([]),
    ])

    const quizAverage = this.calcAverage(quizGrades.map((qg) => qg.percentage))
    const assignmentAverage = this.calcAverage(submissions.map((s) => s.percentage))

    const overallGrade = this.calcOverallGrade(
      quizAverage,
      assignmentAverage,
      course.quizWeight,
      course.assignmentWeight,
    )

    const totalItems = quizGrades.length + submissions.length
    const gradedItems = quizGrades.length + submissions.length
    const progress = totalItems > 0 ? Math.round((gradedItems / totalItems) * 100) : 0

    return {
      courseId: course.id,
      courseTitle: course.title,
      quizWeight: course.quizWeight,
      assignmentWeight: course.assignmentWeight,
      quizAverage,
      assignmentAverage,
      overallGrade,
      quizGrades,
      assignmentGrades: submissions,
      completedItems: gradedItems,
      totalItems,
      progress,
    }
  }

  /**
   * Computes weighted overall grade from quiz and assignment averages.
   * Returns null if either component is null AND the respective weight > 0.
   * If a component is null, its weight is redistributed to the other component.
   */
  calcOverallGrade(
    quizAvg: number | null,
    assignmentAvg: number | null,
    quizWeight: number,
    assignmentWeight: number,
  ): number | null {
    const quizW = quizWeight / 100
    const assignW = assignmentWeight / 100

    if (quizAvg === null && assignmentAvg === null) return null

    if (quizAvg === null) {
      // All weight goes to assignments
      return assignmentAvg
    }
    if (assignmentAvg === null) {
      // All weight goes to quizzes
      return quizAvg
    }

    const total = quizAvg * quizW + assignmentAvg * assignW
    return Math.round(total * 100) / 100
  }

  private calcAverage(percentages: number[]): number | null {
    if (percentages.length === 0) return null
    const avg = percentages.reduce((sum, p) => sum + p, 0) / percentages.length
    return Math.round(avg * 100) / 100
  }
}

// ─── Payload adapter ───────────────────────────────────────────────────────────

import type { Payload, CollectionSlug } from 'payload'

function normalizeId(value: string | { id: string }): string {
  return typeof value === 'string' ? value : value.id
}

function normalizeDate(value: string | Date | undefined): Date {
  if (!value) return new Date()
  if (value instanceof Date) return value
  return new Date(value)
}

interface CourseDoc {
  id: string | number
  title: string
  quizWeight?: number
  assignmentWeight?: number
  modules?: Array<{ id: string | number }>
  [key: string]: unknown
}

interface ModuleDoc {
  id: string | number
  course?: string | { id: string }
  [key: string]: unknown
}

interface QuizDoc {
  id: string | number
  module?: string | { id: string }
  passingScore?: number
  [key: string]: unknown
}

interface QuizAttemptDoc {
  id: string | number
  user?: string | { id: string }
  quiz?: string | { id: string }
  score?: number
  passed?: boolean
  completedAt?: string | Date
  [key: string]: unknown
}

interface SubmissionDoc {
  id: string | number
  student?: string | { id: string }
  assignment?: string | { id: string }
  grade?: number
  maxScore?: number
  submittedAt?: string | Date
  status?: string
  [key: string]: unknown
}

interface EnrollmentDoc {
  id: string | number
  student?: string | { id: string }
  course?: string | { id: string }
  status?: string
  [key: string]: unknown
}

interface AssignmentDoc {
  id: string | number
  module?: string | { id: string }
  maxScore?: number
  [key: string]: unknown
}

export class PayloadGradebookService {
  constructor(private payload: Payload) {}

  async getStudentGradebook(studentId: string) {
    const service = new GradebookService({
      getEnrollmentsForStudent: async (sid) => this.getEnrollmentsForStudent(sid),
      getEnrollmentsForCourse: async () => [], // not needed for student view
      getCourse: async (cid) => this.getCourse(cid),
      getQuizzesForModules: async (mids) => this.getQuizzesForModules(mids),
      getQuizAttemptsForStudent: async (sid, quizIds) => this.getQuizAttemptsForStudent(sid, quizIds),
      getSubmissionsForStudent: async (sid, assignmentIds) => this.getSubmissionsForStudent(sid, assignmentIds),
    })
    return service.getStudentGradebook(studentId)
  }

  async getCourseGradebook(courseId: string) {
    const service = new GradebookService({
      getEnrollmentsForStudent: async () => [], // not needed for course view
      getEnrollmentsForCourse: async (cid) => this.getEnrollmentsForCourse(cid),
      getCourse: async (cid) => this.getCourse(cid),
      getQuizzesForModules: async (mids) => this.getQuizzesForModules(mids),
      getQuizAttemptsForStudent: async (sid, quizIds) => this.getQuizAttemptsForStudent(sid, quizIds),
      getSubmissionsForStudent: async (sid, assignmentIds) => this.getSubmissionsForStudent(sid, assignmentIds),
    })
    return service.getCourseGradebook(courseId)
  }

  private async getEnrollmentsForStudent(studentId: string) {
    const result = await this.payload.find({
      collection: 'enrollments' as CollectionSlug,
      where: { student: { equals: studentId } },
      limit: 0,
    })
    return result.docs.map((doc: unknown) => {
      const d = doc as EnrollmentDoc
      return {
        id: String(d.id),
        courseId: normalizeId(d.course as string | { id: string }),
        status: d.status ?? 'active',
      }
    })
  }

  private async getEnrollmentsForCourse(courseId: string) {
    const result = await this.payload.find({
      collection: 'enrollments' as CollectionSlug,
      where: { course: { equals: courseId } },
      limit: 0,
    })
    return result.docs.map((doc: unknown) => {
      const d = doc as EnrollmentDoc
      return {
        id: String(d.id),
        studentId: normalizeId(d.student as string | { id: string }),
        status: d.status ?? 'active',
      }
    })
  }

  private async getCourse(courseId: string) {
    const doc = (await this.payload.findByID({
      collection: 'courses' as CollectionSlug,
      id: courseId,
    })) as unknown as CourseDoc

    if (!doc) return null

    // Get module IDs from the course's modules relationship
    const moduleIds: string[] = []
    const modules = (doc.modules as Array<{ id: string | number }> | undefined) ?? []
    for (const mod of modules) {
      moduleIds.push(String(mod.id))
    }

    // If no modules loaded, fetch modules that belong to this course via their course relationship
    if (moduleIds.length === 0) {
      const modulesResult = await this.payload.find({
        collection: 'modules' as CollectionSlug,
        where: { course: { equals: courseId } },
        limit: 0,
      })
      for (const mod of modulesResult.docs as unknown as ModuleDoc[]) {
        moduleIds.push(String(mod.id))
      }
    }

    return {
      id: String(doc.id),
      title: doc.title ?? 'Untitled',
      quizWeight: (doc.quizWeight as number) ?? 40,
      assignmentWeight: (doc.assignmentWeight as number) ?? 60,
      moduleIds,
    }
  }

  private async getQuizzesForModules(moduleIds: string[]) {
    if (moduleIds.length === 0) return []
    const result = await this.payload.find({
      collection: 'quizzes' as CollectionSlug,
      where: {
        module: { in: moduleIds },
      },
      limit: 0,
    })
    return result.docs.map((doc: unknown) => {
      const d = doc as QuizDoc
      return {
        id: String(d.id),
        moduleId: normalizeId(d.module as string | { id: string }),
        maxScore: 100,
      }
    })
  }

  private async getQuizAttemptsForStudent(studentId: string, quizIds: string[]) {
    if (quizIds.length === 0) return []
    const result = await this.payload.find({
      collection: 'quiz-attempts' as CollectionSlug,
      where: {
        user: { equals: studentId },
        quiz: { in: quizIds },
      },
      limit: 0,
    })
    const grades: QuizGrade[] = []
    for (const doc of result.docs as unknown as QuizAttemptDoc[]) {
      const quiz = doc.quiz as string | { id: string }
      const quizId = normalizeId(quiz)
      const maxScore = 100
      const score = doc.score ?? 0
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
      grades.push({
        quizId,
        score,
        maxScore,
        percentage,
        passed: doc.passed ?? false,
        completedAt: normalizeDate(doc.completedAt as string | Date | undefined),
      })
    }
    return grades
  }

  private async getSubmissionsForStudent(studentId: string, assignmentIds: string[]) {
    if (assignmentIds.length === 0) return []
    const result = await this.payload.find({
      collection: 'submissions' as CollectionSlug,
      where: {
        student: { equals: studentId },
        assignment: { in: assignmentIds },
        status: { equals: 'graded' },
      },
      limit: 0,
    })
    const grades: AssignmentGrade[] = []
    for (const doc of result.docs as unknown as SubmissionDoc[]) {
      const maxScore = doc.maxScore ?? 100
      const grade = doc.grade ?? 0
      const percentage = maxScore > 0 ? Math.round((grade / maxScore) * 100) : 0
      grades.push({
        submissionId: String(doc.id),
        assignmentId: normalizeId(doc.assignment as string | { id: string }),
        grade,
        maxScore,
        percentage,
        submittedAt: normalizeDate(doc.submittedAt as string | Date | undefined),
      })
    }
    return grades
  }
}
