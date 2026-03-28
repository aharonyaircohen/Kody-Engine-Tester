/**
 * Payload-backed implementation of GradebookService.
 * Wires the generic GradebookService to Payload CMS collections.
 */
import type { CollectionSlug, Payload } from 'payload'
import { GradebookService, type StudentGradebookEntry, type CourseGradebookEntry } from './gradebook'

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

export class PayloadGradebookService {
  private svc: GradebookService<
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
    this.svc = new GradebookService({
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
    return this.svc.getStudentGradebook(studentId)
  }

  async getCourseGradebook(courseId: string): Promise<CourseGradebookEntry[]> {
    return this.svc.getCourseGradebook(courseId)
  }
}
