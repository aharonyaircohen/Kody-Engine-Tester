/**
 * @ai-summary
 * Aggregates all grades for a student (or all students in a course) across
 * quizzes and assignments using weighted averages.
 *
 * WHY: Provides a framework-agnostic gradebook that can be wired to any
 * backend via dep interfaces. Used by both student dashboard and instructor
 * gradebook views.
 *
 * TRAP: Quiz average uses BEST ATTEMPT percentage per quiz — only the highest
 * scoring attempt counts, not the latest. If all attempts score 0%, the quiz
 * contributes 0 to the average. Weights default to 40/60 (quiz/assignment) when
 * the course document omits them; division-by-zero (no quizzes or no assignments)
 * returns 0 without throwing.
 */
export interface StudentGradebookEntry {
  courseId: string
  courseTitle: string
  quizAverage: number
  assignmentAverage: number
  overallGrade: number
  quizWeight: number
  assignmentWeight: number
  progress: number
}

export interface CourseGradebookEntry {
  studentId: string
  quizAverage: number
  assignmentAverage: number
  overallGrade: number
  quizWeight: number
  assignmentWeight: number
}

export interface CourseEnrollmentRef {
  enrollmentId: string
  studentId: string
}

export interface GradebookServiceDeps<
  TCourse,
  TQuiz,
  TQuizAttempt,
  TAssignment,
  TSubmission,
  TEnrollment,
  TLesson,
  TCompletedLesson,
> {
  getCourse: (id: string) => Promise<TCourse | null>
  getQuizzes: (courseId: string) => Promise<TQuiz[]>
  getQuizAttempts: (studentId: string, quizId: string) => Promise<TQuizAttempt[]>
  getAssignments: (courseId: string) => Promise<TAssignment[]>
  getSubmissions: (studentId: string, assignmentId: string) => Promise<TSubmission[]>
  getEnrollments: (studentId: string) => Promise<TEnrollment[]>
  getCourseEnrollments: (courseId: string) => Promise<CourseEnrollmentRef[]>
  getLessons: (courseId: string) => Promise<TLesson[]>
  getCompletedLessons: (enrollmentId: string) => Promise<TCompletedLesson[]>
}

// Utility: extract a numeric property from an object, returning 0 for null/undefined
function num(val: number | null | undefined): number {
  return val ?? 0
}

export class GradebookService<
  TCourse,
  TQuiz,
  TQuizAttempt,
  TAssignment,
  TSubmission,
  TEnrollment,
  TLesson,
  TCompletedLesson,
> {
  constructor(private deps: GradebookServiceDeps<TCourse, TQuiz, TQuizAttempt, TAssignment, TSubmission, TEnrollment, TLesson, TCompletedLesson>) {}

  /**
   * Returns gradebook entries for every active enrollment a student has.
   */
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

      const overallGrade = Math.round(
        (quizWeight / 100) * quizAverage + (assignmentWeight / 100) * assignmentAverage,
      )

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

  /**
   * Returns gradebook entries for every student enrolled in a course.
   */
  async getCourseGradebook(courseId: string): Promise<CourseGradebookEntry[]> {
    const course = await this.deps.getCourse(courseId)
    if (!course) return []

    const courseRecord = course as unknown as { quizWeight?: number; assignmentWeight?: number }
    const quizWeight = num(courseRecord.quizWeight) || 40
    const assignmentWeight = num(courseRecord.assignmentWeight) || 60

    // Get all enrollments for this course
    const courseEnrollments = await this.deps.getCourseEnrollments(courseId)

    const entries: CourseGradebookEntry[] = []

    for (const enrollment of courseEnrollments) {
      const studentId = enrollment.studentId
      if (!studentId) continue

      const [quizAverage, assignmentAverage] = await Promise.all([
        this.getQuizAverage(studentId, courseId),
        this.getAssignmentAverage(studentId, courseId),
      ])

      const overallGrade = Math.round(
        (quizWeight / 100) * quizAverage + (assignmentWeight / 100) * assignmentAverage,
      )

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

      // Best attempt = highest percentage
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

    if (bestPercents.length === 0) return 0
    return bestPercents.reduce((sum, p) => sum + p, 0) / bestPercents.length
  }

  private async getAssignmentAverage(studentId: string, courseId: string): Promise<number> {
    const assignments = await this.deps.getAssignments(courseId)
    if (assignments.length === 0) return 0

    const gradedPercents: number[] = []

    for (const assignment of assignments) {
      const assignmentRecord = assignment as unknown as { maxScore?: number; id: string }
      const maxScore = num(assignmentRecord.maxScore) || 100
      const submissions = await this.deps.getSubmissions(studentId, assignmentRecord.id)
      // Use the latest graded submission (grade !== null)
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
