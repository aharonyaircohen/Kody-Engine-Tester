import { describe, it, expect } from 'vitest'
import {
  AnalyticsService,
  EnrollmentRecord,
  ModuleRecord,
  QuizAttemptRecord,
  SubmissionRecord,
  AnalyticsServiceDeps,
} from './analytics'

// ─── Test helpers ─────────────────────────────────────────────────────────────

function makeDeps(overrides: Partial<AnalyticsServiceDeps> = {}): AnalyticsServiceDeps {
  return {
    getEnrollmentsByCourse: async () => [],
    getModulesByCourse: async () => [],
    getTotalLessonsByCourse: async () => 0,
    getQuizAttemptsByCourse: async () => [],
    getSubmissionsByCourse: async () => [],
    getCoursesByInstructor: async () => [],
    ...overrides,
  }
}

function enrollment(overrides: Partial<EnrollmentRecord> = {}): EnrollmentRecord {
  return {
    id: 'e1',
    studentId: 's1',
    studentName: 'Student 1',
    status: 'active',
    completedLessonIds: [],
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AnalyticsService', () => {
  describe('getCourseAnalytics', () => {
    it('returns zeros for a course with no enrollments', async () => {
      const svc = new AnalyticsService(makeDeps())
      const result = await svc.getCourseAnalytics('c1')
      expect(result.totalEnrollments).toBe(0)
      expect(result.activeStudents).toBe(0)
      expect(result.completionRate).toBe(0)
      expect(result.averageGrade).toBeNull()
      expect(result.atRiskStudents).toEqual([])
    })

    it('excludes dropped enrollments from counts', async () => {
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [
          enrollment({ id: 'e1', studentId: 's1', status: 'active' }),
          enrollment({ id: 'e2', studentId: 's2', status: 'dropped' }),
          enrollment({ id: 'e3', studentId: 's3', status: 'completed' }),
        ],
      }))
      const result = await svc.getCourseAnalytics('c1')
      expect(result.totalEnrollments).toBe(2)
      expect(result.activeStudents).toBe(1)
    })

    it('computes completion rate from non-dropped enrollments', async () => {
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [
          enrollment({ id: 'e1', status: 'completed' }),
          enrollment({ id: 'e2', studentId: 's2', status: 'active' }),
          enrollment({ id: 'e3', studentId: 's3', status: 'completed' }),
          enrollment({ id: 'e4', studentId: 's4', status: 'dropped' }),
        ],
      }))
      const result = await svc.getCourseAnalytics('c1')
      // 2 completed / 3 non-dropped = 67%
      expect(result.completionRate).toBe(67)
    })

    it('computes weighted average grade from quizzes and assignments', async () => {
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [enrollment()],
        getQuizAttemptsByCourse: async () => [
          { quizId: 'q1', quizTitle: 'Q1', userId: 's1', score: 80 },
          { quizId: 'q1', quizTitle: 'Q1', userId: 's2', score: 60 },
        ],
        getSubmissionsByCourse: async () => [
          { studentId: 's1', grade: 90, maxScore: 100 },
          { studentId: 's2', grade: 70, maxScore: 100 },
        ],
      }))
      const result = await svc.getCourseAnalytics('c1')
      // Quiz avg: 70, Assignment avg: 80. Weighted: 70*0.4 + 80*0.6 = 76
      expect(result.averageGrade).toBe(76)
    })

    it('returns quiz-only average when no graded submissions', async () => {
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [enrollment()],
        getQuizAttemptsByCourse: async () => [
          { quizId: 'q1', quizTitle: 'Q1', userId: 's1', score: 85 },
        ],
      }))
      const result = await svc.getCourseAnalytics('c1')
      expect(result.averageGrade).toBe(85)
    })

    it('returns assignment-only average when no quiz attempts', async () => {
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [enrollment()],
        getSubmissionsByCourse: async () => [
          { studentId: 's1', grade: 45, maxScore: 50 },
        ],
      }))
      const result = await svc.getCourseAnalytics('c1')
      // 45/50 * 100 = 90
      expect(result.averageGrade).toBe(90)
    })

    it('computes module-by-module completion breakdown', async () => {
      const modules: ModuleRecord[] = [
        { id: 'm1', title: 'Module 1', lessonIds: ['l1', 'l2'] },
        { id: 'm2', title: 'Module 2', lessonIds: ['l3', 'l4'] },
      ]
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [
          enrollment({ id: 'e1', studentId: 's1', completedLessonIds: ['l1', 'l2', 'l3'] }),
          enrollment({ id: 'e2', studentId: 's2', completedLessonIds: ['l1'] }),
        ],
        getModulesByCourse: async () => modules,
      }))
      const result = await svc.getCourseAnalytics('c1')
      // Module 1: s1=2/2=100%, s2=1/2=50%, avg=75%
      expect(result.moduleCompletions[0]).toEqual({ moduleId: 'm1', moduleTitle: 'Module 1', completionRate: 75 })
      // Module 2: s1=1/2=50%, s2=0/2=0%, avg=25%
      expect(result.moduleCompletions[1]).toEqual({ moduleId: 'm2', moduleTitle: 'Module 2', completionRate: 25 })
    })

    it('identifies the most difficult quiz', async () => {
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [enrollment()],
        getQuizAttemptsByCourse: async () => [
          { quizId: 'q1', quizTitle: 'Easy Quiz', userId: 's1', score: 90 },
          { quizId: 'q1', quizTitle: 'Easy Quiz', userId: 's2', score: 80 },
          { quizId: 'q2', quizTitle: 'Hard Quiz', userId: 's1', score: 40 },
          { quizId: 'q2', quizTitle: 'Hard Quiz', userId: 's2', score: 30 },
        ],
      }))
      const result = await svc.getCourseAnalytics('c1')
      expect(result.mostDifficultQuiz).toEqual({ quizId: 'q2', quizTitle: 'Hard Quiz', averageScore: 35 })
    })

    it('identifies at-risk students with low progress', async () => {
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [
          enrollment({ id: 'e1', studentId: 's1', studentName: 'Alice', completedLessonIds: ['l1'] }),
        ],
        getTotalLessonsByCourse: async () => 10,
      }))
      const result = await svc.getCourseAnalytics('c1')
      expect(result.atRiskStudents).toHaveLength(1)
      expect(result.atRiskStudents[0].reason).toBe('low-progress')
      expect(result.atRiskStudents[0].progressPercentage).toBe(10)
    })

    it('identifies at-risk students with low grade', async () => {
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [
          enrollment({ id: 'e1', studentId: 's1', studentName: 'Bob', completedLessonIds: ['l1', 'l2', 'l3', 'l4', 'l5'] }),
        ],
        getTotalLessonsByCourse: async () => 10,
        getQuizAttemptsByCourse: async () => [
          { quizId: 'q1', quizTitle: 'Q1', userId: 's1', score: 40 },
        ],
      }))
      const result = await svc.getCourseAnalytics('c1')
      expect(result.atRiskStudents).toHaveLength(1)
      expect(result.atRiskStudents[0].reason).toBe('low-grade')
    })

    it('does not flag completed enrollments as at-risk', async () => {
      const svc = new AnalyticsService(makeDeps({
        getEnrollmentsByCourse: async () => [
          enrollment({ id: 'e1', studentId: 's1', status: 'completed', completedLessonIds: ['l1'] }),
        ],
        getTotalLessonsByCourse: async () => 10,
      }))
      const result = await svc.getCourseAnalytics('c1')
      expect(result.atRiskStudents).toHaveLength(0)
    })
  })

  describe('getInstructorOverview', () => {
    it('returns zeros when instructor has no courses', async () => {
      const svc = new AnalyticsService(makeDeps())
      const result = await svc.getInstructorOverview('i1')
      expect(result).toEqual({ totalCourses: 0, totalStudents: 0, averageCompletionRate: 0 })
    })

    it('aggregates across multiple courses', async () => {
      const enrollmentsByCourse: Record<string, EnrollmentRecord[]> = {
        c1: [
          enrollment({ id: 'e1', studentId: 's1', status: 'completed' }),
          enrollment({ id: 'e2', studentId: 's2', status: 'active' }),
        ],
        c2: [
          enrollment({ id: 'e3', studentId: 's3', status: 'completed' }),
        ],
      }
      const svc = new AnalyticsService(makeDeps({
        getCoursesByInstructor: async () => [{ id: 'c1' }, { id: 'c2' }],
        getEnrollmentsByCourse: async (courseId) => enrollmentsByCourse[courseId] ?? [],
      }))
      const result = await svc.getInstructorOverview('i1')
      expect(result.totalCourses).toBe(2)
      expect(result.totalStudents).toBe(3)
      // c1: 1/2=50%, c2: 1/1=100%, avg=75%
      expect(result.averageCompletionRate).toBe(75)
    })
  })
})
