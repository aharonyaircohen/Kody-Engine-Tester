// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModuleCompletion {
  moduleId: string
  moduleTitle: string
  completionRate: number
}

export interface AtRiskStudent {
  studentId: string
  studentName: string
  progressPercentage: number
  averageGrade: number | null
  reason: 'low-progress' | 'low-grade' | 'both'
}

export interface CourseAnalytics {
  totalEnrollments: number
  activeStudents: number
  completionRate: number
  averageGrade: number | null
  moduleCompletions: ModuleCompletion[]
  mostDifficultQuiz: { quizId: string; quizTitle: string; averageScore: number } | null
  atRiskStudents: AtRiskStudent[]
}

export interface InstructorOverview {
  totalCourses: number
  totalStudents: number
  averageCompletionRate: number
}

// ─── Dependency contracts ─────────────────────────────────────────────────────

export interface EnrollmentRecord {
  id: string
  studentId: string
  studentName: string
  status: 'active' | 'completed' | 'dropped'
  completedLessonIds: string[]
}

export interface QuizAttemptRecord {
  quizId: string
  quizTitle: string
  userId: string
  score: number
}

export interface SubmissionRecord {
  studentId: string
  grade: number | null
  maxScore: number
}

export interface ModuleRecord {
  id: string
  title: string
  lessonIds: string[]
}

export interface AnalyticsServiceDeps {
  getEnrollmentsByCourse: (courseId: string) => Promise<EnrollmentRecord[]>
  getModulesByCourse: (courseId: string) => Promise<ModuleRecord[]>
  getTotalLessonsByCourse: (courseId: string) => Promise<number>
  getQuizAttemptsByCourse: (courseId: string) => Promise<QuizAttemptRecord[]>
  getSubmissionsByCourse: (courseId: string) => Promise<SubmissionRecord[]>
  getCoursesByInstructor: (instructorId: string) => Promise<{ id: string }[]>
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROGRESS_THRESHOLD = 50
const PASSING_GRADE = 70
const QUIZ_WEIGHT = 0.4
const ASSIGNMENT_WEIGHT = 0.6

// ─── Service ──────────────────────────────────────────────────────────────────

export class AnalyticsService {
  constructor(private deps: AnalyticsServiceDeps) {}

  async getCourseAnalytics(courseId: string): Promise<CourseAnalytics> {
    const [enrollments, modules, totalLessons, quizAttempts, submissions] = await Promise.all([
      this.deps.getEnrollmentsByCourse(courseId),
      this.deps.getModulesByCourse(courseId),
      this.deps.getTotalLessonsByCourse(courseId),
      this.deps.getQuizAttemptsByCourse(courseId),
      this.deps.getSubmissionsByCourse(courseId),
    ])

    const nonDropped = enrollments.filter((e) => e.status !== 'dropped')
    const totalEnrollments = nonDropped.length
    const activeStudents = nonDropped.filter((e) => e.status === 'active').length
    const completedCount = nonDropped.filter((e) => e.status === 'completed').length
    const completionRate = totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : 0

    const averageGrade = this.computeAverageGrade(quizAttempts, submissions)
    const moduleCompletions = this.computeModuleCompletions(modules, nonDropped)
    const mostDifficultQuiz = this.computeMostDifficultQuiz(quizAttempts)
    const atRiskStudents = this.computeAtRiskStudents(nonDropped, totalLessons, quizAttempts, submissions)

    return {
      totalEnrollments,
      activeStudents,
      completionRate,
      averageGrade,
      moduleCompletions,
      mostDifficultQuiz,
      atRiskStudents,
    }
  }

  async getInstructorOverview(instructorId: string): Promise<InstructorOverview> {
    const courses = await this.deps.getCoursesByInstructor(instructorId)
    if (courses.length === 0) {
      return { totalCourses: 0, totalStudents: 0, averageCompletionRate: 0 }
    }

    const analytics = await Promise.all(courses.map((c) => this.getCourseAnalytics(c.id)))
    const totalStudents = analytics.reduce((sum, a) => sum + a.totalEnrollments, 0)
    const avgCompletion =
      analytics.length > 0
        ? Math.round(analytics.reduce((sum, a) => sum + a.completionRate, 0) / analytics.length)
        : 0

    return {
      totalCourses: courses.length,
      totalStudents,
      averageCompletionRate: avgCompletion,
    }
  }

  private computeAverageGrade(
    quizAttempts: QuizAttemptRecord[],
    submissions: SubmissionRecord[],
  ): number | null {
    const quizAvg = quizAttempts.length > 0
      ? quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length
      : null

    const gradedSubmissions = submissions.filter((s) => s.grade !== null)
    const assignmentAvg = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => sum + ((s.grade! / s.maxScore) * 100), 0) / gradedSubmissions.length
      : null

    if (quizAvg === null && assignmentAvg === null) return null
    if (quizAvg === null) return Math.round(assignmentAvg!)
    if (assignmentAvg === null) return Math.round(quizAvg)
    return Math.round(quizAvg * QUIZ_WEIGHT + assignmentAvg * ASSIGNMENT_WEIGHT)
  }

  private computeModuleCompletions(
    modules: ModuleRecord[],
    enrollments: EnrollmentRecord[],
  ): ModuleCompletion[] {
    if (enrollments.length === 0) return modules.map((m) => ({ moduleId: m.id, moduleTitle: m.title, completionRate: 0 }))

    return modules.map((mod) => {
      if (mod.lessonIds.length === 0) {
        return { moduleId: mod.id, moduleTitle: mod.title, completionRate: 0 }
      }
      const rates = enrollments.map((e) => {
        const completed = mod.lessonIds.filter((lid) => e.completedLessonIds.includes(lid)).length
        return completed / mod.lessonIds.length
      })
      const avgRate = Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 100)
      return { moduleId: mod.id, moduleTitle: mod.title, completionRate: avgRate }
    })
  }

  private computeMostDifficultQuiz(
    attempts: QuizAttemptRecord[],
  ): { quizId: string; quizTitle: string; averageScore: number } | null {
    if (attempts.length === 0) return null

    const quizScores = new Map<string, { title: string; scores: number[] }>()
    for (const a of attempts) {
      const entry = quizScores.get(a.quizId) ?? { title: a.quizTitle, scores: [] }
      entry.scores.push(a.score)
      quizScores.set(a.quizId, entry)
    }

    let hardest: { quizId: string; quizTitle: string; averageScore: number } | null = null
    for (const [quizId, { title, scores }] of quizScores) {
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      if (!hardest || avg < hardest.averageScore) {
        hardest = { quizId, quizTitle: title, averageScore: avg }
      }
    }
    return hardest
  }

  private computeAtRiskStudents(
    enrollments: EnrollmentRecord[],
    totalLessons: number,
    quizAttempts: QuizAttemptRecord[],
    submissions: SubmissionRecord[],
  ): AtRiskStudent[] {
    const activeEnrollments = enrollments.filter((e) => e.status === 'active')
    const result: AtRiskStudent[] = []

    for (const enrollment of activeEnrollments) {
      const progressPct = totalLessons > 0
        ? Math.round((enrollment.completedLessonIds.length / totalLessons) * 100)
        : 0

      const studentQuizzes = quizAttempts.filter((a) => a.userId === enrollment.studentId)
      const studentSubmissions = submissions.filter((s) => s.studentId === enrollment.studentId && s.grade !== null)
      const avgGrade = this.computeAverageGrade(studentQuizzes, studentSubmissions)

      const lowProgress = progressPct < PROGRESS_THRESHOLD
      const lowGrade = avgGrade !== null && avgGrade < PASSING_GRADE

      if (lowProgress || lowGrade) {
        result.push({
          studentId: enrollment.studentId,
          studentName: enrollment.studentName,
          progressPercentage: progressPct,
          averageGrade: avgGrade,
          reason: lowProgress && lowGrade ? 'both' : lowProgress ? 'low-progress' : 'low-grade',
        })
      }
    }

    return result
  }
}
