// Mock enrollment store for LMS course enrollment checks.
// Replace with a real Payload/DB-backed collection when Enrollments is implemented.

export interface Enrollment {
  userId: string
  courseId: string
  enrolledAt: Date
}

export class EnrollmentStore {
  private enrollments: Map<string, Enrollment> = new Map() // key: `${userId}:${courseId}`

  /**
   * @deprecated Direct use does not enforce capacity limits. Use `enrollmentService.requestEnrollment` instead.
   */
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

  /**
   * @deprecated Does not enforce capacity limits. Use `enrollmentService` for state-aware checks.
   */
  isEnrolled(userId: string, courseId: string): boolean {
    return this.enrollments.has(`${userId}:${courseId}`)
  }

  /**
   * @deprecated Direct use does not trigger waitlist auto-promotion. Use `enrollmentService.withdraw` instead.
   */
  unenroll(userId: string, courseId: string): boolean {
    return this.enrollments.delete(`${userId}:${courseId}`)
  }

  getEnrollmentsForUser(userId: string): Enrollment[] {
    return Array.from(this.enrollments.values()).filter((e) => e.userId === userId)
  }

  getEnrollmentsForCourse(courseId: string): Enrollment[] {
    return Array.from(this.enrollments.values()).filter((e) => e.courseId === courseId)
  }

  /**
   * Sets the enrollment capacity for a course.
   * Pass `null` to indicate unlimited (legacy default).
   * @throws {Error} if capacity is negative.
   */
  setCapacity(courseId: string, capacity: number | null): void {
    if (capacity !== null && capacity < 0) {
      throw new Error('Capacity cannot be negative')
    }
    this.capacities.set(courseId, capacity)
  }

  /**
   * Returns the enrollment capacity for a course.
   * `null` means unlimited (backward-compatible default for courses with no capacity set).
   */
  getCapacity(courseId: string): number | null {
    return this.capacities.get(courseId) ?? null
  }

  /**
   * Returns the number of currently enrolled students for a course.
   */
  getEnrolledCount(courseId: string): number {
    return this.getEnrollmentsForCourse(courseId).length
  }

  private capacities: Map<string, number | null> = new Map()
}

// Shared singleton for runtime use (seeded with test data below)
export const enrollmentStore = new EnrollmentStore()

// Seed data: student-enrolled student and unenrolled student
// These IDs match the seed users in user-store.ts once those are replaced with student/instructor roles.
enrollmentStore.enroll('seed-student-enrolled', 'seed-course-1')
