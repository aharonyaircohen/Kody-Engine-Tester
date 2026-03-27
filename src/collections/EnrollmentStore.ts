// Mock enrollment store for LMS course enrollment checks.
// Replace with a real Payload/DB-backed collection when Enrollments is implemented.

export interface Enrollment {
  userId: string
  courseId: string
  enrolledAt: Date
}

export class EnrollmentStore {
  private enrollments: Map<string, Enrollment> = new Map() // key: `${userId}:${courseId}`

  enroll(userId: string, courseId: string): Enrollment {
    const key = `${userId}:${courseId}`
    const enrollment: Enrollment = {
      userId,
      courseId,
      enrolledAt: new Date(),
    }
    this.enrollments.set(key, enrollment)
    return enrollment
  }

  isEnrolled(userId: string, courseId: string): boolean {
    return this.enrollments.has(`${userId}:${courseId}`)
  }

  unenroll(userId: string, courseId: string): boolean {
    return this.enrollments.delete(`${userId}:${courseId}`)
  }

  getEnrollmentsForUser(userId: string): Enrollment[] {
    return Array.from(this.enrollments.values()).filter((e) => e.userId === userId)
  }

  getEnrollmentsForCourse(courseId: string): Enrollment[] {
    return Array.from(this.enrollments.values()).filter((e) => e.courseId === courseId)
  }
}

// Shared singleton for runtime use (seeded with test data below)
export const enrollmentStore = new EnrollmentStore()

// Seed data: student-enrolled student and unenrolled student
// These IDs match the seed users in user-store.ts once those are replaced with student/instructor roles.
enrollmentStore.enroll('seed-student-enrolled', 'seed-course-1')
