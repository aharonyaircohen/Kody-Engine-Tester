import { describe, it, expect } from 'vitest'
import {
  GradebookService,
  type QuizAttempt,
  type AssignmentSubmission,
  type CourseRecord,
  type EnrollmentRecord,
  type LessonCount,
} from './gradebook'

// ─── Mock factories ────────────────────────────────────────────────────────────

interface MockDeps {
  getEnrollments: (studentId: string) => Promise<EnrollmentRecord[]>
  getCourse: (courseId: string) => Promise<CourseRecord | null>
  getQuizAttempts: (studentId: string, courseId: string) => Promise<QuizAttempt[]>
  getSubmissions: (studentId: string, courseId: string) => Promise<AssignmentSubmission[]>
  getCompletedLessons: (enrollmentId: string) => Promise<string[]>
  getTotalLessons: (courseId: string) => Promise<LessonCount>
}

function makeDeps(overrides: Partial<MockDeps> = {}): MockDeps {
  return {
    getEnrollments: async () => [],
    getCourse: async () => null,
    getQuizAttempts: async () => [],
    getSubmissions: async () => [],
    getCompletedLessons: async () => [],
    getTotalLessons: async () => ({ total: 0 }),
    ...overrides,
  }
}

const defaultCourse = (): CourseRecord =>
  ({
    id: 'course-1',
    title: 'Test Course',
    quizWeight: 40,
    assignmentWeight: 60,
    instructorId: 'instructor-1',
  }) as unknown as CourseRecord

const defaultEnrollment = (): EnrollmentRecord =>
  ({
    id: 'enrollment-1',
    studentId: 'student-1',
    courseId: 'course-1',
    status: 'active',
    enrolledAt: new Date(),
  }) as unknown as EnrollmentRecord

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('GradebookService', () => {
  describe('getStudentGradebook', () => {
    it('returns empty array when student has no enrollments', async () => {
      const deps = makeDeps({ getEnrollments: async () => [] })
      const service = new GradebookService(deps)
      const result = await service.getStudentGradebook('student-1')
      expect(result).toEqual([])
    })

    it('returns empty course grade when student has no grades', async () => {
      const deps = makeDeps({
        getEnrollments: async () => [defaultEnrollment()],
        getCourse: async () => defaultCourse(),
        getCompletedLessons: async () => [],
        getTotalLessons: async () => ({ total: 0 }),
      })
      const service = new GradebookService(deps)
      const result = await service.getStudentGradebook('student-1')
      expect(result).toHaveLength(1)
      expect(result[0].courseId).toBe('course-1')
      expect(result[0].quizAverage).toBeNull()
      expect(result[0].assignmentAverage).toBeNull()
      expect(result[0].overallGrade).toBeNull()
    })

    it('computes quiz average from best attempts per quiz', async () => {
      const deps = makeDeps({
        getEnrollments: async () => [defaultEnrollment()],
        getCourse: async () => defaultCourse(),
        getQuizAttempts: async () => [
          { id: 'a1', quizId: 'quiz-1', score: 70, maxScore: 100, studentId: 'student-1', completedAt: new Date() },
          { id: 'a2', quizId: 'quiz-1', score: 90, maxScore: 100, studentId: 'student-1', completedAt: new Date() },
          { id: 'a3', quizId: 'quiz-2', score: 80, maxScore: 100, studentId: 'student-1', completedAt: new Date() },
        ],
        getSubmissions: async () => [],
        getCompletedLessons: async () => [],
        getTotalLessons: async () => ({ total: 0 }),
      })
      const service = new GradebookService(deps)
      const result = await service.getStudentGradebook('student-1')
      // Best attempt per quiz: quiz-1 → 90%, quiz-2 → 80%. Average = 85%
      expect(result[0].quizAverage).toBe(85)
    })

    it('computes assignment average from graded submissions', async () => {
      const deps = makeDeps({
        getEnrollments: async () => [defaultEnrollment()],
        getCourse: async () => defaultCourse(),
        getQuizAttempts: async () => [],
        getSubmissions: async () => [
          { id: 's1', assignmentId: 'asgn-1', grade: 80, maxScore: 100, studentId: 'student-1', submittedAt: new Date() },
          { id: 's2', assignmentId: 'asgn-2', grade: 90, maxScore: 100, studentId: 'student-1', submittedAt: new Date() },
        ],
        getCompletedLessons: async () => [],
        getTotalLessons: async () => ({ total: 0 }),
      })
      const service = new GradebookService(deps)
      const result = await service.getStudentGradebook('student-1')
      expect(result[0].assignmentAverage).toBe(85)
    })

    it('computes weighted overall grade using default weights (quizzes 40%, assignments 60%)', async () => {
      const deps = makeDeps({
        getEnrollments: async () => [defaultEnrollment()],
        getCourse: async () => defaultCourse(),
        getQuizAttempts: async () => [
          { id: 'a1', quizId: 'quiz-1', score: 80, maxScore: 100, studentId: 'student-1', completedAt: new Date() },
        ],
        getSubmissions: async () => [
          { id: 's1', assignmentId: 'asgn-1', grade: 100, maxScore: 100, studentId: 'student-1', submittedAt: new Date() },
        ],
        getCompletedLessons: async () => [],
        getTotalLessons: async () => ({ total: 0 }),
      })
      const service = new GradebookService(deps)
      const result = await service.getStudentGradebook('student-1')
      // Quiz: 80%, Asgn: 100%. Overall = 0.4 * 80 + 0.6 * 100 = 32 + 60 = 92
      expect(result[0].overallGrade).toBe(92)
    })

    it('uses custom per-course weights', async () => {
      const deps = makeDeps({
        getEnrollments: async () => [defaultEnrollment()],
        getCourse: async () => ({
          ...defaultCourse(),
          quizWeight: 30,
          assignmentWeight: 70,
        }),
        getQuizAttempts: async () => [
          { id: 'a1', quizId: 'quiz-1', score: 60, maxScore: 100, studentId: 'student-1', completedAt: new Date() },
        ],
        getSubmissions: async () => [
          { id: 's1', assignmentId: 'asgn-1', grade: 80, maxScore: 100, studentId: 'student-1', submittedAt: new Date() },
        ],
        getCompletedLessons: async () => [],
        getTotalLessons: async () => ({ total: 0 }),
      })
      const service = new GradebookService(deps)
      const result = await service.getStudentGradebook('student-1')
      // Quiz: 60%, Asgn: 80%. Overall = 0.3 * 60 + 0.7 * 80 = 18 + 56 = 74
      expect(result[0].overallGrade).toBe(74)
    })

    it('returns null overallGrade when only quizzes exist', async () => {
      const deps = makeDeps({
        getEnrollments: async () => [defaultEnrollment()],
        getCourse: async () => defaultCourse(),
        getQuizAttempts: async () => [
          { id: 'a1', quizId: 'quiz-1', score: 70, maxScore: 100, studentId: 'student-1', completedAt: new Date() },
        ],
        getSubmissions: async () => [],
        getCompletedLessons: async () => [],
        getTotalLessons: async () => ({ total: 0 }),
      })
      const service = new GradebookService(deps)
      const result = await service.getStudentGradebook('student-1')
      expect(result[0].quizAverage).toBe(70)
      expect(result[0].assignmentAverage).toBeNull()
      expect(result[0].overallGrade).toBeNull()
    })

    it('returns null overallGrade when only assignments exist', async () => {
      const deps = makeDeps({
        getEnrollments: async () => [defaultEnrollment()],
        getCourse: async () => defaultCourse(),
        getQuizAttempts: async () => [],
        getSubmissions: async () => [
          { id: 's1', assignmentId: 'asgn-1', grade: 85, maxScore: 100, studentId: 'student-1', submittedAt: new Date() },
        ],
        getCompletedLessons: async () => [],
        getTotalLessons: async () => ({ total: 0 }),
      })
      const service = new GradebookService(deps)
      const result = await service.getStudentGradebook('student-1')
      expect(result[0].quizAverage).toBeNull()
      expect(result[0].assignmentAverage).toBe(85)
      expect(result[0].overallGrade).toBeNull()
    })

    it('aggregates across multiple courses', async () => {
      const enrollment2: EnrollmentRecord = {
        id: 'enrollment-2',
        studentId: 'student-1',
        courseId: 'course-2',
        status: 'active',
        enrolledAt: new Date(),
      } as unknown as EnrollmentRecord

      const deps = makeDeps({
        getEnrollments: async () => [defaultEnrollment(), enrollment2],
        getCourse: async (id: string) => {
          if (id === 'course-1') return defaultCourse()
          return { id: 'course-2', title: 'Course 2', quizWeight: 40, assignmentWeight: 60, instructorId: 'instructor-1' } as unknown as CourseRecord
        },
        getQuizAttempts: async (_studentId: string, courseId: string) => {
          if (courseId === 'course-1') return [{ id: 'a1', quizId: 'quiz-1', score: 100, maxScore: 100, studentId: 'student-1', completedAt: new Date() }]
          return [{ id: 'a2', quizId: 'quiz-2', score: 50, maxScore: 100, studentId: 'student-1', completedAt: new Date() }]
        },
        getSubmissions: async () => [],
        getCompletedLessons: async () => [],
        getTotalLessons: async () => ({ total: 0 }),
      })
      const service = new GradebookService(deps)
      const result = await service.getStudentGradebook('student-1')
      expect(result).toHaveLength(2)
      expect(result[0].quizAverage).toBe(100)
      expect(result[1].quizAverage).toBe(50)
    })

    it('only includes active enrollments', async () => {
      const droppedEnrollment: EnrollmentRecord = {
        id: 'enrollment-dropped',
        studentId: 'student-1',
        courseId: 'course-dropped',
        status: 'dropped',
        enrolledAt: new Date(),
      } as unknown as EnrollmentRecord

      const deps = makeDeps({
        getEnrollments: async () => [defaultEnrollment(), droppedEnrollment],
        getCourse: async () => defaultCourse(),
        getQuizAttempts: async () => [],
        getSubmissions: async () => [],
        getCompletedLessons: async () => [],
        getTotalLessons: async () => ({ total: 0 }),
      })
      const service = new GradebookService(deps)
      const result = await service.getStudentGradebook('student-1')
      expect(result).toHaveLength(1)
      expect(result[0].courseId).toBe('course-1')
    })

    it('computes progress correctly', async () => {
      const deps = makeDeps({
        getEnrollments: async () => [defaultEnrollment()],
        getCourse: async () => defaultCourse(),
        getQuizAttempts: async () => [],
        getSubmissions: async () => [],
        getCompletedLessons: async () => ['lesson-1', 'lesson-2'],
        getTotalLessons: async () => ({ total: 5 }),
      })
      const service = new GradebookService(deps)
      const result = await service.getStudentGradebook('student-1')
      expect(result[0].progress).toEqual({ completedLessons: 2, totalLessons: 5, percentage: 40 })
    })

    it('handles zero total lessons gracefully', async () => {
      const deps = makeDeps({
        getEnrollments: async () => [defaultEnrollment()],
        getCourse: async () => defaultCourse(),
        getQuizAttempts: async () => [],
        getSubmissions: async () => [],
        getCompletedLessons: async () => [],
        getTotalLessons: async () => ({ total: 0 }),
      })
      const service = new GradebookService(deps)
      const result = await service.getStudentGradebook('student-1')
      expect(result[0].progress).toEqual({ completedLessons: 0, totalLessons: 0, percentage: 0 })
    })

    it('normalizes maxScore 0 quiz attempts to 0%', async () => {
      const deps = makeDeps({
        getEnrollments: async () => [defaultEnrollment()],
        getCourse: async () => defaultCourse(),
        getQuizAttempts: async () => [
          { id: 'a1', quizId: 'quiz-1', score: 0, maxScore: 0, studentId: 'student-1', completedAt: new Date() },
        ],
        getSubmissions: async () => [],
        getCompletedLessons: async () => [],
        getTotalLessons: async () => ({ total: 0 }),
      })
      const service = new GradebookService(deps)
      const result = await service.getStudentGradebook('student-1')
      expect(result[0].quizAverage).toBe(0)
    })

    it('normalizes null maxScore quiz attempts to 0%', async () => {
      const deps = makeDeps({
        getEnrollments: async () => [defaultEnrollment()],
        getCourse: async () => defaultCourse(),
        getQuizAttempts: async () => [
          { id: 'a1', quizId: 'quiz-1', score: 80, maxScore: null as unknown as number, studentId: 'student-1', completedAt: new Date() },
        ],
        getSubmissions: async () => [],
        getCompletedLessons: async () => [],
        getTotalLessons: async () => ({ total: 0 }),
      })
      const service = new GradebookService(deps)
      const result = await service.getStudentGradebook('student-1')
      expect(result[0].quizAverage).toBe(0)
    })
  })

  describe('getCourseGradebook', () => {
    it('returns empty array when course has no enrollments', async () => {
      const deps = makeDeps({ getEnrollments: async () => [] })
      const service = new GradebookService(deps)
      const result = await service.getCourseGradebook('course-1', 'instructor-1')
      expect(result).toEqual([])
    })

    it('returns empty array when course does not exist', async () => {
      const deps = makeDeps({ getCourse: async () => null })
      const service = new GradebookService(deps)
      const result = await service.getCourseGradebook('nonexistent', 'instructor-1')
      expect(result).toEqual([])
    })

    it('returns student summaries for a course', async () => {
      const enrollment1: EnrollmentRecord = {
        id: 'e1', studentId: 'student-1', courseId: 'course-1', status: 'active', enrolledAt: new Date(),
      } as unknown as EnrollmentRecord
      const enrollment2: EnrollmentRecord = {
        id: 'e2', studentId: 'student-2', courseId: 'course-1', status: 'active', enrolledAt: new Date(),
      } as unknown as EnrollmentRecord

      const deps = makeDeps({
        getCourse: async () => defaultCourse(),
        getEnrollments: async () => [enrollment1, enrollment2],
        getQuizAttempts: async (studentId: string) => {
          const scores: Record<string, number> = { 'student-1': 90, 'student-2': 70 }
          return [{ id: 'a1', quizId: 'quiz-1', score: scores[studentId] ?? 0, maxScore: 100, studentId, completedAt: new Date() }]
        },
        getSubmissions: async (studentId: string) => {
          const scores: Record<string, number> = { 'student-1': 100, 'student-2': 80 }
          return [{ id: 's1', assignmentId: 'asgn-1', grade: scores[studentId] ?? 0, maxScore: 100, studentId, submittedAt: new Date() }]
        },
        getCompletedLessons: async () => [],
        getTotalLessons: async () => ({ total: 0 }),
      })
      const service = new GradebookService(deps)
      const result = await service.getCourseGradebook('course-1', 'instructor-1')
      expect(result).toHaveLength(2)
      // student-1: quiz=90, asgn=100, overall=0.4*90+0.6*100=96
      const s1 = result.find((r) => r.studentId === 'student-1')!
      expect(s1.quizAverage).toBe(90)
      expect(s1.assignmentAverage).toBe(100)
      expect(s1.overallGrade).toBe(96)
    })

    it('skips non-active enrollments', async () => {
      const enrollment1: EnrollmentRecord = {
        id: 'e1', studentId: 'student-1', courseId: 'course-1', status: 'active', enrolledAt: new Date(),
      } as unknown as EnrollmentRecord
      const droppedEnrollment: EnrollmentRecord = {
        id: 'e2', studentId: 'student-2', courseId: 'course-1', status: 'dropped', enrolledAt: new Date(),
      } as unknown as EnrollmentRecord

      const deps = makeDeps({
        getCourse: async () => defaultCourse(),
        getEnrollments: async () => [enrollment1, droppedEnrollment],
        getQuizAttempts: async () => [],
        getSubmissions: async () => [],
        getCompletedLessons: async () => [],
        getTotalLessons: async () => ({ total: 0 }),
      })
      const service = new GradebookService(deps)
      const result = await service.getCourseGradebook('course-1', 'instructor-1')
      expect(result).toHaveLength(1)
      expect(result[0].studentId).toBe('student-1')
    })
  })

  describe('grade calculations', () => {
    it('rounds overallGrade to 2 decimal places', async () => {
      const deps = makeDeps({
        getEnrollments: async () => [defaultEnrollment()],
        getCourse: async () => defaultCourse(),
        getQuizAttempts: async () => [
          { id: 'a1', quizId: 'quiz-1', score: 33, maxScore: 100, studentId: 'student-1', completedAt: new Date() },
        ],
        getSubmissions: async () => [
          { id: 's1', assignmentId: 'asgn-1', grade: 66, maxScore: 100, studentId: 'student-1', submittedAt: new Date() },
        ],
        getCompletedLessons: async () => [],
        getTotalLessons: async () => ({ total: 0 }),
      })
      const service = new GradebookService(deps)
      const result = await service.getStudentGradebook('student-1')
      // 0.4 * 33 + 0.6 * 66 = 13.2 + 39.6 = 52.8
      expect(result[0].overallGrade).toBe(52.8)
    })

    it('handles empty quiz attempts array', async () => {
      const deps = makeDeps({
        getEnrollments: async () => [defaultEnrollment()],
        getCourse: async () => defaultCourse(),
        getQuizAttempts: async () => [],
        getSubmissions: async () => [],
        getCompletedLessons: async () => [],
        getTotalLessons: async () => ({ total: 0 }),
      })
      const service = new GradebookService(deps)
      const result = await service.getStudentGradebook('student-1')
      expect(result[0].quizAverage).toBeNull()
    })

    it('handles empty submissions array', async () => {
      const deps = makeDeps({
        getEnrollments: async () => [defaultEnrollment()],
        getCourse: async () => defaultCourse(),
        getQuizAttempts: async () => [],
        getSubmissions: async () => [],
        getCompletedLessons: async () => [],
        getTotalLessons: async () => ({ total: 0 }),
      })
      const service = new GradebookService(deps)
      const result = await service.getStudentGradebook('student-1')
      expect(result[0].assignmentAverage).toBeNull()
    })
  })
})
