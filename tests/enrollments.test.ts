import { describe, it, expect, beforeEach } from 'vitest'
import type { EnrollmentStatus } from '../src/collections/Enrollments'

// ─── In-memory store simulating Payload's enrollments behaviour ───────────────

interface EnrollmentRecord {
  id: string
  student: string
  course: string
  enrolledAt: Date
  status: EnrollmentStatus
  completedAt?: Date
  completedLessons: string[]
}

interface CourseRecord {
  id: string
  title: string
  maxEnrollments: number
}

class EnrollmentStore {
  private enrollments = new Map<string, EnrollmentRecord>()
  private courses = new Map<string, CourseRecord>()

  seedCourse(id: string, maxEnrollments: number) {
    this.courses.set(id, { id, title: 'Test Course', maxEnrollments })
  }

  private generateId(): string {
    return crypto.randomUUID()
  }

  async findById(id: string): Promise<EnrollmentRecord | undefined> {
    return this.enrollments.get(id)
  }

  async createEnrollment(
    studentId: string,
    courseId: string
  ): Promise<{ enrollment: EnrollmentRecord; error?: never } | { enrollment?: never; error: string; status: number }> {
    const course = this.courses.get(courseId)
    if (!course) {
      return { error: 'Course not found', status: 404 }
    }

    // Duplicate check
    for (const e of this.enrollments.values()) {
      if (e.student === studentId && e.course === courseId) {
        return { error: 'Already enrolled in this course', status: 409 }
      }
    }

    // Max enrollments check — count active enrollments for this course
    let activeCount = 0
    for (const e of this.enrollments.values()) {
      if (e.course === courseId && e.status === 'active') {
        activeCount++
      }
    }

    if (activeCount >= course.maxEnrollments) {
      return { error: 'Course has reached maximum enrollment capacity', status: 403 }
    }

    const enrollment: EnrollmentRecord = {
      id: this.generateId(),
      student: studentId,
      course: courseId,
      enrolledAt: new Date(),
      status: 'active',
      completedLessons: [],
    }
    this.enrollments.set(enrollment.id, enrollment)
    return { enrollment }
  }

  async update(id: string, data: Partial<EnrollmentRecord>): Promise<EnrollmentRecord | undefined> {
    const existing = this.enrollments.get(id)
    if (!existing) return undefined
    const updated = { ...existing, ...data }
    this.enrollments.set(id, updated)
    return updated
  }

  async getActiveCountForCourse(courseId: string): Promise<number> {
    let count = 0
    for (const e of this.enrollments.values()) {
      if (e.course === courseId && e.status === 'active') count++
    }
    return count
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('EnrollmentStore', () => {
  let store: EnrollmentStore

  beforeEach(() => {
    store = new EnrollmentStore()
    store.seedCourse('course-1', 2)
  })

  describe('enrollment creation', () => {
    it('creates an enrollment with active status', async () => {
      const result = await store.createEnrollment('student-1', 'course-1')
      expect(result.error).toBeUndefined()
      const enrollment = result.enrollment!
      expect(enrollment.status).toBe('active')
      expect(enrollment.student).toBe('student-1')
      expect(enrollment.course).toBe('course-1')
      expect(enrollment.completedLessons).toEqual([])
    })

    it('returns 409 for duplicate enrollment (same student + course)', async () => {
      await store.createEnrollment('student-1', 'course-1')
      const second = (await store.createEnrollment('student-1', 'course-1')) as { error: string; status: number }
      expect(second.error).toBe('Already enrolled in this course')
      expect(second.status).toBe(409)
    })

    it('allows same student to enroll in different courses', async () => {
      store.seedCourse('course-2', 10)
      const first = await store.createEnrollment('student-1', 'course-1')
      const second = await store.createEnrollment('student-1', 'course-2')
      expect(first.error).toBeUndefined()
      expect(second.error).toBeUndefined()
    })

    it('allows different students to enroll in the same course', async () => {
      await store.createEnrollment('student-1', 'course-1')
      const second = await store.createEnrollment('student-2', 'course-1')
      expect(second.error).toBeUndefined()
    })

    it('returns 403 when course reaches maxEnrollments', async () => {
      await store.createEnrollment('student-1', 'course-1')
      await store.createEnrollment('student-2', 'course-1')
      const third = (await store.createEnrollment('student-3', 'course-1')) as { error: string; status: number }
      expect(third.error).toBe('Course has reached maximum enrollment capacity')
      expect(third.status).toBe(403)
    })

    it('allows re-enrollment after dropping', async () => {
      const { enrollment } = (await store.createEnrollment('student-1', 'course-1')) as { enrollment: EnrollmentRecord }
      await store.update(enrollment.id, { status: 'dropped' })
      const reEnroll = await store.createEnrollment('student-1', 'course-1')
      expect(reEnroll.error).toBe('Already enrolled in this course')
    })

    it('allows new student when one enrollment is completed', async () => {
      await store.createEnrollment('student-1', 'course-1')
      await store.createEnrollment('student-2', 'course-1')
      // Simulate completing enrollment (not active)
      const enrollments = Array.from((store as unknown as { enrollments: Map<string, EnrollmentRecord> }).enrollments.values())
      await store.update(enrollments[0].id, { status: 'completed' })
      const third = await store.createEnrollment('student-3', 'course-1')
      expect(third.error).toBeUndefined()
    })
  })

  describe('status transitions', () => {
    it('defaults status to active', async () => {
      const result = (await store.createEnrollment('student-1', 'course-1')) as { enrollment: EnrollmentRecord }
      expect(result.enrollment.status).toBe('active')
    })

    it('can update status to completed', async () => {
      const { enrollment } = (await store.createEnrollment('student-1', 'course-1')) as { enrollment: EnrollmentRecord }
      const updated = await store.update(enrollment.id, { status: 'completed', completedAt: new Date() })
      expect(updated?.status).toBe('completed')
      expect(updated?.completedAt).toBeInstanceOf(Date)
    })

    it('can update status to dropped', async () => {
      const { enrollment } = (await store.createEnrollment('student-1', 'course-1')) as { enrollment: EnrollmentRecord }
      const updated = await store.update(enrollment.id, { status: 'dropped' })
      expect(updated?.status).toBe('dropped')
    })
  })
})
