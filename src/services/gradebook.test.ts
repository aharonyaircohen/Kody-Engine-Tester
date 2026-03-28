import { describe, it, expect } from 'vitest'
import { GradebookService, type QuizGrade, type AssignmentGrade } from './gradebook'

// ─── Test fixture helpers ──────────────────────────────────────────────────────

interface MockEnrollment {
  id: string
  studentId: string
  courseId: string
  status: string
}

interface MockCourse {
  id: string
  title: string
  quizWeight: number
  assignmentWeight: number
  moduleIds: string[]
}

function makeMockDeps() {
  const enrollments: MockEnrollment[] = []
  const courses: Map<string, MockCourse> = new Map()
  const quizAttempts: Map<string, QuizGrade[]> = new Map() // key: studentId
  const submissions: Map<string, AssignmentGrade[]> = new Map() // key: studentId

  const service = new GradebookService({
    getEnrollmentsForStudent: async (studentId) =>
      enrollments.filter((e) => e.studentId === studentId),
    getEnrollmentsForCourse: async (courseId) =>
      enrollments.filter((e) => e.courseId === courseId),
    getCourse: async (courseId) => courses.get(courseId) ?? null,
    getQuizzesForModules: async (moduleIds) => {
      // Return 2 quizzes per module
      const quizzes: Array<{ id: string; moduleId: string; maxScore: number }> = []
      for (const mid of moduleIds) {
        quizzes.push({ id: `quiz-${mid}-1`, moduleId: mid, maxScore: 100 })
        quizzes.push({ id: `quiz-${mid}-2`, moduleId: mid, maxScore: 100 })
      }
      return quizzes
    },
    getQuizAttemptsForStudent: async (studentId, quizIds) => {
      const grades = quizAttempts.get(studentId) ?? []
      return grades.filter((g) => quizIds.includes(g.quizId))
    },
    // getSubmissionsForStudent: called with assignmentIds from quizzes in buildCourseGradebook.
    // The mock ignores assignmentIds and returns all submissions for the student,
    // which is sufficient for unit-testing the GradebookService aggregation logic.
    getSubmissionsForStudent: async (studentId, _assignmentIds) => submissions.get(studentId) ?? [],
  })

  return { service, enrollments, courses, quizAttempts, submissions }
}

function addEnrollment(
  enrollments: MockEnrollment[],
  studentId: string,
  courseId: string,
  status = 'active',
) {
  enrollments.push({ id: `enrollment-${enrollments.length + 1}`, studentId, courseId, status })
}

function addCourse(
  courses: Map<string, MockCourse>,
  id: string,
  title: string,
  overrides: Partial<MockCourse> = {},
) {
  courses.set(id, {
    id,
    title,
    quizWeight: 40,
    assignmentWeight: 60,
    moduleIds: [`module-${id}`],
    ...overrides,
  })
}

function addQuizGrade(quizAttempts: Map<string, QuizGrade[]>, studentId: string, grade: QuizGrade) {
  const existing = quizAttempts.get(studentId) ?? []
  quizAttempts.set(studentId, [...existing, grade])
}

function addSubmissionGrade(submissions: Map<string, AssignmentGrade[]>, studentId: string, grade: AssignmentGrade) {
  const existing = submissions.get(studentId) ?? []
  submissions.set(studentId, [...existing, grade])
}

// ─── getStudentGradebook ──────────────────────────────────────────────────────

describe('getStudentGradebook', () => {
  it('returns empty gradebook when student has no enrollments', async () => {
    const { service } = makeMockDeps()
    const result = await service.getStudentGradebook('student-1')
    expect(result.studentId).toBe('student-1')
    expect(result.courses).toHaveLength(0)
    expect(result.overallAverage).toBeNull()
    expect(result.totalCourses).toBe(0)
    expect(result.activeCourses).toBe(0)
    expect(result.completedCourses).toBe(0)
  })

  it('aggregates quiz and assignment grades correctly', async () => {
    const { service, enrollments, courses, quizAttempts, submissions } = makeMockDeps()
    addEnrollment(enrollments, 'student-1', 'course-1')
    addCourse(courses, 'course-1', 'Intro to Programming')

    // getQuizzesForModules returns ids: quiz-module-course-1-1, quiz-module-course-1-2
    addQuizGrade(quizAttempts, 'student-1', {
      quizId: 'quiz-module-course-1-1',
      score: 80,
      maxScore: 100,
      percentage: 80,
      passed: true,
      completedAt: new Date(),
    })
    addQuizGrade(quizAttempts, 'student-1', {
      quizId: 'quiz-module-course-1-2',
      score: 90,
      maxScore: 100,
      percentage: 90,
      passed: true,
      completedAt: new Date(),
    })
    // Mock ignores assignmentIds filter, so any assignmentId works
    addSubmissionGrade(submissions, 'student-1', {
      submissionId: 'sub-1',
      assignmentId: 'assign-1',
      grade: 85,
      maxScore: 100,
      percentage: 85,
      submittedAt: new Date(),
    })

    const result = await service.getStudentGradebook('student-1')

    expect(result.courses).toHaveLength(1)
    const course = result.courses[0]
    expect(course.quizAverage).toBe(85) // (80 + 90) / 2
    expect(course.assignmentAverage).toBe(85)
    expect(course.quizWeight).toBe(40)
    expect(course.assignmentWeight).toBe(60)
    // overall = 85 * 0.4 + 85 * 0.6 = 34 + 51 = 85
    expect(course.overallGrade).toBe(85)
    expect(course.quizGrades).toHaveLength(2)
    expect(course.assignmentGrades).toHaveLength(1)
  })

  it('returns null overallGrade when student has no grades', async () => {
    const { service, enrollments, courses } = makeMockDeps()
    addEnrollment(enrollments, 'student-1', 'course-1')
    addCourse(courses, 'course-1', 'Empty Course')

    const result = await service.getStudentGradebook('student-1')

    expect(result.courses).toHaveLength(1)
    expect(result.courses[0].quizAverage).toBeNull()
    expect(result.courses[0].assignmentAverage).toBeNull()
    expect(result.courses[0].overallGrade).toBeNull()
    expect(result.overallAverage).toBeNull()
  })

  it('tracks active vs completed course counts', async () => {
    const { service, enrollments, courses } = makeMockDeps()
    addEnrollment(enrollments, 'student-1', 'course-1', 'active')
    addEnrollment(enrollments, 'student-1', 'course-2', 'completed')
    addEnrollment(enrollments, 'student-1', 'course-3', 'dropped')
    addCourse(courses, 'course-1', 'Active Course')
    addCourse(courses, 'course-2', 'Completed Course')
    addCourse(courses, 'course-3', 'Dropped Course')

    const result = await service.getStudentGradebook('student-1')

    expect(result.totalCourses).toBe(3)
    expect(result.activeCourses).toBe(1)
    expect(result.completedCourses).toBe(1)
  })

  it('computes overallAverage across multiple courses', async () => {
    const { service, enrollments, courses, quizAttempts } = makeMockDeps()
    addEnrollment(enrollments, 'student-1', 'course-1')
    addEnrollment(enrollments, 'student-1', 'course-2')
    addCourse(courses, 'course-1', 'Course 1')
    addCourse(courses, 'course-2', 'Course 2')

    // Course 1: 80 overall (single quiz)
    addQuizGrade(quizAttempts, 'student-1', {
      quizId: 'quiz-module-course-1-1',
      score: 80,
      maxScore: 100,
      percentage: 80,
      passed: true,
      completedAt: new Date(),
    })
    // Course 2: 90 overall (single quiz)
    addQuizGrade(quizAttempts, 'student-1', {
      quizId: 'quiz-module-course-2-1',
      score: 90,
      maxScore: 100,
      percentage: 90,
      passed: true,
      completedAt: new Date(),
    })

    const result = await service.getStudentGradebook('student-1')

    // overallAverage = (80 + 90) / 2 = 85
    expect(result.overallAverage).toBe(85)
  })
})

// ─── getCourseGradebook ────────────────────────────────────────────────────────

describe('getCourseGradebook', () => {
  it('returns empty array when course does not exist', async () => {
    const { service } = makeMockDeps()
    const result = await service.getCourseGradebook('nonexistent-course')
    expect(result).toHaveLength(0)
  })

  it('returns gradebook for each enrolled student', async () => {
    const { service, enrollments, courses, quizAttempts } = makeMockDeps()
    addEnrollment(enrollments, 'student-1', 'course-1')
    addEnrollment(enrollments, 'student-2', 'course-1')
    addCourse(courses, 'course-1', 'Shared Course')

    addQuizGrade(quizAttempts, 'student-1', {
      quizId: 'quiz-module-course-1-1',
      score: 95,
      maxScore: 100,
      percentage: 95,
      passed: true,
      completedAt: new Date(),
    })
    addQuizGrade(quizAttempts, 'student-2', {
      quizId: 'quiz-module-course-1-1',
      score: 70,
      maxScore: 100,
      percentage: 70,
      passed: true,
      completedAt: new Date(),
    })

    const result = await service.getCourseGradebook('course-1')

    expect(result).toHaveLength(2)
    const sorted = result.sort((a, b) => a.studentId.localeCompare(b.studentId))
    expect(sorted[0].studentId).toBe('student-1')
    expect(sorted[0].overallGrade).toBe(95)
    expect(sorted[1].studentId).toBe('student-2')
    expect(sorted[1].overallGrade).toBe(70)
  })
})

// ─── calcOverallGrade ─────────────────────────────────────────────────────────

describe('calcOverallGrade', () => {
  it('computes weighted average with default weights (40/60)', () => {
    const { service } = makeMockDeps()
    // 80% quiz avg, 90% assignment avg → 80*0.4 + 90*0.6 = 32 + 54 = 86
    expect(service.calcOverallGrade(80, 90, 40, 60)).toBe(86)
  })

  it('rounds to 2 decimal places', () => {
    const { service } = makeMockDeps()
    // 75.5% quiz avg, 83.33% assignment avg → 75.5*0.4 + 83.33*0.6 = 30.2 + 49.998 = 80.198 → 80.2
    expect(service.calcOverallGrade(75.5, 83.33, 40, 60)).toBe(80.2)
  })

  it('returns assignment average when quiz average is null', () => {
    const { service } = makeMockDeps()
    expect(service.calcOverallGrade(null, 85, 40, 60)).toBe(85)
  })

  it('returns quiz average when assignment average is null', () => {
    const { service } = makeMockDeps()
    expect(service.calcOverallGrade(78, null, 40, 60)).toBe(78)
  })

  it('returns null when both averages are null', () => {
    const { service } = makeMockDeps()
    expect(service.calcOverallGrade(null, null, 40, 60)).toBeNull()
  })

  it('handles custom per-course weights (50/50)', () => {
    const { service } = makeMockDeps()
    // 80 quiz, 80 assignment, 50/50 → 80
    expect(service.calcOverallGrade(80, 80, 50, 50)).toBe(80)
    // 60 quiz, 100 assignment, 50/50 → 80
    expect(service.calcOverallGrade(60, 100, 50, 50)).toBe(80)
  })

  it('handles edge case: quiz-only weight (100/0)', () => {
    const { service } = makeMockDeps()
    expect(service.calcOverallGrade(92, null, 100, 0)).toBe(92)
    expect(service.calcOverallGrade(92, 70, 100, 0)).toBe(92)
    expect(service.calcOverallGrade(null, 70, 100, 0)).toBe(70)
  })

  it('handles edge case: assignment-only weight (0/100)', () => {
    const { service } = makeMockDeps()
    expect(service.calcOverallGrade(null, 88, 0, 100)).toBe(88)
    expect(service.calcOverallGrade(72, 88, 0, 100)).toBe(88)
    expect(service.calcOverallGrade(72, null, 0, 100)).toBe(72)
  })

  it('rounds 99.99 correctly (max representable with 2 decimal rounding)', () => {
    const { service } = makeMockDeps()
    // 99.99 quiz, 99.99 assignment, 50/50 → 99.99
    const result = service.calcOverallGrade(99.99, 99.99, 50, 50)
    expect(result).toBe(99.99)
  })
})

// ─── Progress tracking ────────────────────────────────────────────────────────

describe('progress tracking', () => {
  it('calculates progress based on graded items count', async () => {
    const { service, enrollments, courses, quizAttempts, submissions } = makeMockDeps()
    addEnrollment(enrollments, 'student-1', 'course-1')
    addCourse(courses, 'course-1', 'Full Coverage Course')

    // getQuizzesForModules returns 2 quizzes; student has 1 quiz grade
    addQuizGrade(quizAttempts, 'student-1', {
      quizId: 'quiz-module-course-1-1',
      score: 80,
      maxScore: 100,
      percentage: 80,
      passed: true,
      completedAt: new Date(),
    })
    // Mock returns all submissions for student (ignores assignmentId filter)
    addSubmissionGrade(submissions, 'student-1', {
      submissionId: 'sub-1',
      assignmentId: 'assign-1',
      grade: 90,
      maxScore: 100,
      percentage: 90,
      submittedAt: new Date(),
    })

    const result = await service.getStudentGradebook('student-1')

    // totalItems = quizGrades.length (1) + submissions.length (1) = 2
    expect(result.courses[0].totalItems).toBe(2)
    // completedItems = quizGrades.length + submissions.length (all are graded)
    expect(result.courses[0].completedItems).toBe(2)
    expect(result.courses[0].progress).toBe(100)
  })

  it('sets progress to 0 when no items are graded', async () => {
    const { service, enrollments, courses } = makeMockDeps()
    addEnrollment(enrollments, 'student-1', 'course-1')
    addCourse(courses, 'course-1', 'Empty Course')

    const result = await service.getStudentGradebook('student-1')

    expect(result.courses[0].totalItems).toBe(0)
    expect(result.courses[0].completedItems).toBe(0)
    expect(result.courses[0].progress).toBe(0)
  })
})

// ─── Empty states ─────────────────────────────────────────────────────────────

describe('empty states', () => {
  it('handles course with no modules gracefully', async () => {
    const { service, enrollments, courses } = makeMockDeps()
    addEnrollment(enrollments, 'student-1', 'course-1')
    addCourse(courses, 'course-1', 'No Modules Course', { moduleIds: [] })

    const result = await service.getStudentGradebook('student-1')

    expect(result.courses).toHaveLength(1)
    expect(result.courses[0].quizGrades).toHaveLength(0)
    expect(result.courses[0].assignmentGrades).toHaveLength(0)
    expect(result.courses[0].overallGrade).toBeNull()
  })

  it('handles student with one graded and one ungraded course', async () => {
    const { service, enrollments, courses, quizAttempts } = makeMockDeps()
    addEnrollment(enrollments, 'student-1', 'course-1')
    addEnrollment(enrollments, 'student-1', 'course-2')
    addCourse(courses, 'course-1', 'Graded Course')
    addCourse(courses, 'course-2', 'Ungraded Course', { moduleIds: [] })

    addQuizGrade(quizAttempts, 'student-1', {
      quizId: 'quiz-module-course-1-1',
      score: 80,
      maxScore: 100,
      percentage: 80,
      passed: true,
      completedAt: new Date(),
    })

    const result = await service.getStudentGradebook('student-1')

    // Only course-1 has grades → overallAverage = 80
    expect(result.overallAverage).toBe(80)
  })
})
