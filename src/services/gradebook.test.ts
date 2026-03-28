import { describe, it, expect, beforeEach } from 'vitest'
import { GradebookService } from './gradebook'

// ─── Mock types ────────────────────────────────────────────────────────────────

interface MockCourse {
  id: string
  title: string
  quizWeight: number
  assignmentWeight: number
}

interface MockQuiz {
  id: string
  courseId: string
  maxScore: number
}

interface MockQuizAttempt {
  id: string
  quizId: string
  user: string | { id: string }
  score: number
  maxScore: number
}

interface MockAssignment {
  id: string
  courseId: string
  maxScore: number
}

interface MockSubmission {
  id: string
  assignmentId: string
  studentId: string
  grade: number | null
}

interface MockEnrollment {
  id: string
  studentId: string
  courseId: string
  status: string
}

interface MockLesson {
  id: string
  courseId: string
}

interface MockCompletedLesson {
  enrollmentId: string
  lessonId: string
}

interface MockCourseEnrollment {
  enrollmentId: string
  studentId: string
}

interface GradebookServiceDeps {
  getCourse: (id: string) => Promise<MockCourse | null>
  getQuizzes: (courseId: string) => Promise<MockQuiz[]>
  getQuizAttempts: (studentId: string, quizId: string) => Promise<MockQuizAttempt[]>
  getAssignments: (courseId: string) => Promise<MockAssignment[]>
  getSubmissions: (studentId: string, assignmentId: string) => Promise<MockSubmission[]>
  getEnrollments: (studentId: string) => Promise<MockEnrollment[]>
  getCourseEnrollments: (courseId: string) => Promise<MockCourseEnrollment[]>
  getLessons: (courseId: string) => Promise<MockLesson[]>
  getCompletedLessons: (enrollmentId: string) => Promise<MockCompletedLesson[]>
}

// ─── Factory ──────────────────────────────────────────────────────────────────

function makeStores() {
  const courses = new Map<string, MockCourse>()
  const quizzes = new Map<string, MockQuiz>()
  const quizAttempts = new Map<string, MockQuizAttempt>()
  const assignments = new Map<string, MockAssignment>()
  const submissions = new Map<string, MockSubmission>()
  const enrollments = new Map<string, MockEnrollment>()
  const lessons = new Map<string, MockLesson>()
  const completedLessons = new Map<string, Set<string>>()

  return {
    courses,
    quizzes,
    quizAttempts,
    assignments,
    submissions,
    enrollments,
    lessons,
    completedLessons,
    deps: {
      getCourse: async (id: string) => courses.get(id) ?? null,
      getQuizzes: async (courseId: string) =>
        [...quizzes.values()].filter((q) => q.courseId === courseId),
      getQuizAttempts: async (studentId: string, quizId: string) =>
        [...quizAttempts.values()].filter(
          (a) =>
            (typeof a.user === 'string' ? a.user : a.user.id) === studentId &&
            a.quizId === quizId,
        ),
      getAssignments: async (courseId: string) =>
        [...assignments.values()].filter((a) => a.courseId === courseId),
      getSubmissions: async (studentId: string, assignmentId: string) =>
        [...submissions.values()].filter(
          (s) => s.studentId === studentId && s.assignmentId === assignmentId,
        ),
      getEnrollments: async (studentId: string) =>
        [...enrollments.values()].filter((e) => e.studentId === studentId && e.status === 'active'),
      getCourseEnrollments: async (courseId: string) =>
        [...enrollments.values()]
          .filter((e) => e.courseId === courseId)
          .map((e) => ({ enrollmentId: e.id, studentId: e.studentId })),
      getLessons: async (courseId: string) =>
        [...lessons.values()].filter((l) => l.courseId === courseId),
      getCompletedLessons: async (enrollmentId: string) =>
        [...(completedLessons.get(enrollmentId) ?? [])].map((lessonId) => ({
          enrollmentId,
          lessonId,
        })),
    } as GradebookServiceDeps,
  }
}

// ─── Test helpers ──────────────────────────────────────────────────────────────

function addCourse(
  courses: Map<string, MockCourse>,
  id: string,
  overrides: Partial<MockCourse> = {},
) {
  const course: MockCourse = {
    id,
    title: `Course ${id}`,
    quizWeight: 40,
    assignmentWeight: 60,
    ...overrides,
  }
  courses.set(id, course)
  return course
}

function addQuiz(
  quizzes: Map<string, MockQuiz>,
  id: string,
  courseId: string,
  maxScore = 100,
) {
  const quiz: MockQuiz = { id, courseId, maxScore }
  quizzes.set(id, quiz)
  return quiz
}

function addQuizAttempt(
  quizAttempts: Map<string, MockQuizAttempt>,
  id: string,
  studentId: string,
  quizId: string,
  score: number,
  maxScore = 100,
) {
  const attempt: MockQuizAttempt = { id, user: studentId, quizId, score, maxScore }
  quizAttempts.set(id, attempt)
  return attempt
}

function addAssignment(
  assignments: Map<string, MockAssignment>,
  id: string,
  courseId: string,
  maxScore = 100,
) {
  const assignment: MockAssignment = { id, courseId, maxScore }
  assignments.set(id, assignment)
  return assignment
}

function addSubmission(
  submissions: Map<string, MockSubmission>,
  id: string,
  studentId: string,
  assignmentId: string,
  grade: number | null,
) {
  const submission: MockSubmission = { id, studentId, assignmentId, grade }
  submissions.set(id, submission)
  return submission
}

function addEnrollment(
  enrollments: Map<string, MockEnrollment>,
  id: string,
  studentId: string,
  courseId: string,
  status = 'active',
) {
  const enrollment: MockEnrollment = { id, studentId, courseId, status }
  enrollments.set(id, enrollment)
  return enrollment
}

function addLesson(
  lessons: Map<string, MockLesson>,
  id: string,
  courseId: string,
) {
  const lesson: MockLesson = { id, courseId }
  lessons.set(id, lesson)
  return lesson
}

function addCompletedLesson(
  completedLessons: Map<string, Set<string>>,
  enrollmentId: string,
  lessonId: string,
) {
  if (!completedLessons.has(enrollmentId)) {
    completedLessons.set(enrollmentId, new Set())
  }
  completedLessons.get(enrollmentId)!.add(lessonId)
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('GradebookService', () => {
  let svc: GradebookService<MockCourse, MockQuiz, MockQuizAttempt, MockAssignment, MockSubmission, MockEnrollment, MockLesson, MockCompletedLesson>

  beforeEach(() => {
    const { deps } = makeStores()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    svc = new GradebookService(deps as any)
  })

  describe('getStudentGradebook', () => {
    it('returns empty array when student has no enrollments', async () => {
      const { deps } = makeStores()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      svc = new GradebookService(deps as any)
      const result = await svc.getStudentGradebook('student-1')
      expect(result).toEqual([])
    })

    it('returns course gradebook with no grades when student is enrolled but has no attempts', async () => {
      const { courses, enrollments, quizzes, assignments, lessons, deps } =
        makeStores()
      addCourse(courses, 'course-1')
      addEnrollment(enrollments, 'enroll-1', 'student-1', 'course-1')
      addQuiz(quizzes, 'quiz-1', 'course-1')
      addAssignment(assignments, 'assign-1', 'course-1')
      addLesson(lessons, 'lesson-1', 'course-1')
      // no attempts or submissions

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      svc = new GradebookService(deps as any)
      const result = await svc.getStudentGradebook('student-1')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        courseId: 'course-1',
        courseTitle: 'Course course-1',
        quizAverage: 0,
        assignmentAverage: 0,
        overallGrade: 0,
        quizWeight: 40,
        assignmentWeight: 60,
        progress: 0,
      })
    })

    it('calculates quiz average using best attempt per quiz', async () => {
      const { courses, enrollments, quizzes, quizAttempts, assignments, lessons, deps } =
        makeStores()
      addCourse(courses, 'course-1')
      addEnrollment(enrollments, 'enroll-1', 'student-1', 'course-1')
      addQuiz(quizzes, 'quiz-1', 'course-1', 100)
      addQuiz(quizzes, 'quiz-2', 'course-1', 100)
      // Best attempt for quiz-1: 80, for quiz-2: 90
      addQuizAttempt(quizAttempts, 'a1', 'student-1', 'quiz-1', 60, 100)
      addQuizAttempt(quizAttempts, 'a2', 'student-1', 'quiz-1', 80, 100) // best
      addQuizAttempt(quizAttempts, 'a3', 'student-1', 'quiz-2', 90, 100)
      addAssignment(assignments, 'assign-1', 'course-1')
      addLesson(lessons, 'lesson-1', 'course-1')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      svc = new GradebookService(deps as any)
      const result = await svc.getStudentGradebook('student-1')

      expect(result[0].quizAverage).toBe(85) // (80 + 90) / 2
    })

    it('calculates assignment average from graded submissions only', async () => {
      const { courses, enrollments, quizzes, assignments, submissions, lessons, deps } =
        makeStores()
      addCourse(courses, 'course-1')
      addEnrollment(enrollments, 'enroll-1', 'student-1', 'course-1')
      addAssignment(assignments, 'assign-1', 'course-1', 100)
      addAssignment(assignments, 'assign-2', 'course-1', 100)
      addSubmission(submissions, 's1', 'student-1', 'assign-1', 70)
      addSubmission(submissions, 's2', 'student-1', 'assign-2', 90)
      // ungraded submission (grade = null) should be excluded
      addSubmission(submissions, 's3', 'student-1', 'assign-2', null)
      addQuiz(quizzes, 'quiz-1', 'course-1')
      addLesson(lessons, 'lesson-1', 'course-1')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      svc = new GradebookService(deps as any)
      const result = await svc.getStudentGradebook('student-1')

      expect(result[0].assignmentAverage).toBe(80) // (70 + 90) / 2
    })

    it('calculates overall grade using default weights 40/60', async () => {
      const { courses, enrollments, quizzes, quizAttempts, assignments, submissions, lessons, deps } =
        makeStores()
      addCourse(courses, 'course-1', { quizWeight: 40, assignmentWeight: 60 })
      addEnrollment(enrollments, 'enroll-1', 'student-1', 'course-1')
      addQuiz(quizzes, 'quiz-1', 'course-1', 100)
      addQuizAttempt(quizAttempts, 'a1', 'student-1', 'quiz-1', 80, 100)
      addAssignment(assignments, 'assign-1', 'course-1', 100)
      addSubmission(submissions, 's1', 'student-1', 'assign-1', 70)
      addLesson(lessons, 'lesson-1', 'course-1')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      svc = new GradebookService(deps as any)
      const result = await svc.getStudentGradebook('student-1')

      // overall = 0.4 * 80 + 0.6 * 70 = 32 + 42 = 74
      expect(result[0].overallGrade).toBe(74)
    })

    it('uses custom per-course weights', async () => {
      const { courses, enrollments, quizzes, quizAttempts, assignments, submissions, lessons, deps } =
        makeStores()
      addCourse(courses, 'course-1', { quizWeight: 60, assignmentWeight: 40 })
      addEnrollment(enrollments, 'enroll-1', 'student-1', 'course-1')
      addQuiz(quizzes, 'quiz-1', 'course-1', 100)
      addQuizAttempt(quizAttempts, 'a1', 'student-1', 'quiz-1', 80, 100)
      addAssignment(assignments, 'assign-1', 'course-1', 100)
      addSubmission(submissions, 's1', 'student-1', 'assign-1', 70)
      addLesson(lessons, 'lesson-1', 'course-1')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      svc = new GradebookService(deps as any)
      const result = await svc.getStudentGradebook('student-1')

      // overall = 0.6 * 80 + 0.4 * 70 = 48 + 28 = 76
      expect(result[0].overallGrade).toBe(76)
    })

    it('calculates progress as percentage of completed lessons', async () => {
      const { courses, enrollments, quizzes, lessons, completedLessons, deps } =
        makeStores()
      addCourse(courses, 'course-1')
      addEnrollment(enrollments, 'enroll-1', 'student-1', 'course-1')
      addQuiz(quizzes, 'quiz-1', 'course-1')
      addLesson(lessons, 'lesson-1', 'course-1')
      addLesson(lessons, 'lesson-2', 'course-1')
      addLesson(lessons, 'lesson-3', 'course-1')
      addLesson(lessons, 'lesson-4', 'course-1')
      addCompletedLesson(completedLessons, 'enroll-1', 'lesson-1')
      addCompletedLesson(completedLessons, 'enroll-1', 'lesson-2')
      // 2 of 4 lessons complete = 50%

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      svc = new GradebookService(deps as any)
      const result = await svc.getStudentGradebook('student-1')

      expect(result[0].progress).toBe(50)
    })

    it('returns 0 progress when course has no lessons', async () => {
      const { courses, enrollments, quizzes, lessons, deps } =
        makeStores()
      addCourse(courses, 'course-1')
      addEnrollment(enrollments, 'enroll-1', 'student-1', 'course-1')
      addQuiz(quizzes, 'quiz-1', 'course-1')
      // no lessons at all

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      svc = new GradebookService(deps as any)
      const result = await svc.getStudentGradebook('student-1')

      expect(result[0].progress).toBe(0)
    })

    it('only returns gradebook for active enrollments', async () => {
      const { courses, enrollments, quizzes, lessons, deps } =
        makeStores()
      addCourse(courses, 'course-1')
      addEnrollment(enrollments, 'enroll-1', 'student-1', 'course-1', 'active')
      addCourse(courses, 'course-2', { id: 'course-2', title: 'Course 2' })
      addEnrollment(enrollments, 'enroll-2', 'student-1', 'course-2', 'dropped')
      addQuiz(quizzes, 'quiz-1', 'course-1')
      addQuiz(quizzes, 'quiz-2', 'course-2')
      addLesson(lessons, 'lesson-1', 'course-1')
      addLesson(lessons, 'lesson-2', 'course-2')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      svc = new GradebookService(deps as any)
      const result = await svc.getStudentGradebook('student-1')

      expect(result).toHaveLength(1)
      expect(result[0].courseId).toBe('course-1')
    })

    it('normalizes quiz scores to percentage (0-100 scale)', async () => {
      const { courses, enrollments, quizzes, quizAttempts, assignments, submissions, lessons, deps } =
        makeStores()
      addCourse(courses, 'course-1')
      addEnrollment(enrollments, 'enroll-1', 'student-1', 'course-1')
      addQuiz(quizzes, 'quiz-1', 'course-1', 50) // out of 50
      addQuizAttempt(quizAttempts, 'a1', 'student-1', 'quiz-1', 40, 50) // 80%
      addAssignment(assignments, 'assign-1', 'course-1', 200)
      addSubmission(submissions, 's1', 'student-1', 'assign-1', 160) // 80%
      addLesson(lessons, 'lesson-1', 'course-1')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      svc = new GradebookService(deps as any)
      const result = await svc.getStudentGradebook('student-1')

      expect(result[0].quizAverage).toBe(80)
      expect(result[0].assignmentAverage).toBe(80)
      expect(result[0].overallGrade).toBe(80) // 0.4*80 + 0.6*80 = 80
    })
  })

  describe('getCourseGradebook', () => {
    it('returns empty array when course has no enrollments', async () => {
      const { courses, quizzes, assignments, deps } =
        makeStores()
      addCourse(courses, 'course-1')
      addQuiz(quizzes, 'quiz-1', 'course-1')
      addAssignment(assignments, 'assign-1', 'course-1')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      svc = new GradebookService(deps as any)
      const result = await svc.getCourseGradebook('course-1')

      expect(result).toEqual([])
    })

    it('returns all students with their grades for a course', async () => {
      const {
        courses,
        enrollments,
        quizzes,
        quizAttempts,
        assignments,
        submissions,
        lessons,
        deps,
      } = makeStores()
      addCourse(courses, 'course-1')
      addEnrollment(enrollments, 'enroll-1', 'student-1', 'course-1')
      addEnrollment(enrollments, 'enroll-2', 'student-2', 'course-1')
      addQuiz(quizzes, 'quiz-1', 'course-1', 100)
      addAssignment(assignments, 'assign-1', 'course-1', 100)
      addQuizAttempt(quizAttempts, 'a1', 'student-1', 'quiz-1', 80, 100)
      addQuizAttempt(quizAttempts, 'a2', 'student-2', 'quiz-1', 70, 100)
      addSubmission(submissions, 's1', 'student-1', 'assign-1', 90)
      addSubmission(submissions, 's2', 'student-2', 'assign-1', 60)
      addLesson(lessons, 'lesson-1', 'course-1')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      svc = new GradebookService(deps as any)
      const result = await svc.getCourseGradebook('course-1')

      expect(result).toHaveLength(2)

      const student1Result = result.find((r) => r.studentId === 'student-1')!
      expect(student1Result.quizAverage).toBe(80)
      expect(student1Result.assignmentAverage).toBe(90)
      // overall = 0.4*80 + 0.6*90 = 32 + 54 = 86
      expect(student1Result.overallGrade).toBe(86)

      const student2Result = result.find((r) => r.studentId === 'student-2')!
      expect(student2Result.quizAverage).toBe(70)
      expect(student2Result.assignmentAverage).toBe(60)
      // overall = 0.4*70 + 0.6*60 = 28 + 36 = 64
      expect(student2Result.overallGrade).toBe(64)
    })

    it('uses course custom weights for all students', async () => {
      const {
        courses,
        enrollments,
        quizzes,
        quizAttempts,
        assignments,
        submissions,
        lessons,
        deps,
      } = makeStores()
      addCourse(courses, 'course-1', { quizWeight: 30, assignmentWeight: 70 })
      addEnrollment(enrollments, 'enroll-1', 'student-1', 'course-1')
      addQuiz(quizzes, 'quiz-1', 'course-1', 100)
      addAssignment(assignments, 'assign-1', 'course-1', 100)
      addQuizAttempt(quizAttempts, 'a1', 'student-1', 'quiz-1', 100, 100)
      addSubmission(submissions, 's1', 'student-1', 'assign-1', 50)
      addLesson(lessons, 'lesson-1', 'course-1')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      svc = new GradebookService(deps as any)
      const result = await svc.getCourseGradebook('course-1')

      // overall = 0.3*100 + 0.7*50 = 30 + 35 = 65
      expect(result[0].overallGrade).toBe(65)
      expect(result[0].quizWeight).toBe(30)
      expect(result[0].assignmentWeight).toBe(70)
    })
  })
})
