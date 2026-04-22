/**
 * enrollmentService — the only module allowed to call enrollmentStore.{enroll,unenroll,setCapacity}
 * and waitlistStore.{add,remove,popHead}.
 *
 * All multi-store mutations go through this service.
 */

import { EnrollmentStore } from '../collections/EnrollmentStore'
import { NotificationsStore } from '../collections/NotificationsStore'
import { WaitlistStore, type WaitlistEntry } from '../collections/WaitlistStore'

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type EnrollResult =
  | { kind: 'enrolled'; enrollment: import('../collections/EnrollmentStore').Enrollment }
  | { kind: 'waitlisted'; entry: WaitlistEntry }
  | { kind: 'already-enrolled'; enrollment: import('../collections/EnrollmentStore').Enrollment }
  | { kind: 'already-waitlisted'; entry: WaitlistEntry }

export type WithdrawResult =
  | { kind: 'unenrolled'; promotedUserId?: string }
  | { kind: 'left-waitlist' }
  | { kind: 'not-present' }

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class EnrollmentService {
  constructor(
    private enrollmentStore: EnrollmentStore,
    private waitlistStore: WaitlistStore,
    private notificationsStore: NotificationsStore,
  ) {}

  /**
   * Request enrollment for a user in a course.
   *
   * - If already enrolled → `already-enrolled` (no side-effects, no notification).
   * - If already waitlisted → `already-waitlisted` (no side-effects, no notification).
   * - If capacity is `null` (unlimited) → always enrolled.
   * - If enrolled count < capacity → enrolled.
   * - Otherwise → waitlisted.
   */
  requestEnrollment(userId: string, courseId: string): EnrollResult {
    // 1. Already enrolled?
    if (this.enrollmentStore.isEnrolled(userId, courseId)) {
      const enrollment = this.enrollmentStore
        .getEnrollmentsForCourse(courseId)
        .find((e) => e.userId === userId)!
      return { kind: 'already-enrolled', enrollment }
    }

    // 2. Already on waitlist?
    const existingEntry = this.waitlistStore.getEntry(userId, courseId)
    if (existingEntry) {
      return { kind: 'already-waitlisted', entry: existingEntry }
    }

    // 3. Check capacity
    const capacity = this.enrollmentStore.getCapacity(courseId)
    if (capacity === null) {
      // Unlimited
      const enrollment = this.enrollmentStore.enroll(userId, courseId)
      return { kind: 'enrolled', enrollment }
    }

    const enrolledCount = this.enrollmentStore.getEnrolledCount(courseId)
    if (enrolledCount < capacity) {
      const enrollment = this.enrollmentStore.enroll(userId, courseId)
      return { kind: 'enrolled', enrollment }
    }

    // 4. At or over capacity → waitlist
    const entry = this.waitlistStore.add(userId, courseId)
    return { kind: 'waitlisted', entry }
  }

  /**
   * Withdraw a user from a course.
   *
   * - If not present anywhere → `not-present`.
   * - If enrolled → unenrolled. If waitlist is non-empty and seats are available,
   *   the head of the waitlist is auto-promoted and notified.
   * - If on waitlist → removed from waitlist. No auto-promotion.
   */
  withdraw(userId: string, courseId: string): WithdrawResult {
    const wasEnrolled = this.enrollmentStore.isEnrolled(userId, courseId)
    const wasWaitlisted = this.waitlistStore.getEntry(userId, courseId) !== null

    if (!wasEnrolled && !wasWaitlisted) {
      return { kind: 'not-present' }
    }

    if (wasWaitlisted) {
      this.waitlistStore.remove(userId, courseId)
      return { kind: 'left-waitlist' }
    }

    // wasEnrolled
    this.enrollmentStore.unenroll(userId, courseId)

    // Auto-promote from waitlist if seats are available
    const promotedUserId = this.tryPromoteOne(courseId)
    return { kind: 'unenrolled', promotedUserId }
  }

  /**
   * Set (or remove) the enrollment capacity for a course.
   *
   * - If capacity decreases below current enrolled count, existing students are NOT kicked.
   * - If capacity increases (or is set to `null`), eligible waitlisters are promoted in FIFO order.
   * - Returns the list of userIds promoted, in promotion order.
   */
  setCourseCapacity(courseId: string, capacity: number | null): { promoted: string[] } {
    this.enrollmentStore.setCapacity(courseId, capacity)

    const promoted: string[] = []
    // Keep promoting while there are seats and waitlisters
    for (;;) {
      const capacityNow = this.enrollmentStore.getCapacity(courseId)
      const enrolledCount = this.enrollmentStore.getEnrolledCount(courseId)

      // null capacity = unlimited → keep promoting
      // otherwise stop when enrolled >= capacity
      if (capacityNow !== null && enrolledCount >= capacityNow) break

      const head = this.waitlistStore.popHead(courseId)
      if (!head) break

      this.enrollmentStore.enroll(head.userId, courseId)
      this.notificationsStore.create({
        category: 'task',
        type: 'success',
        title: "You're enrolled!",
        message: `You have been enrolled in course ${courseId}.`,
      })
      promoted.push(head.userId)
    }

    return { promoted }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Attempts to promote one user from the waitlist head into an available seat.
   * @returns the userId of the promoted user, or undefined if nothing was promoted.
   */
  private tryPromoteOne(courseId: string): string | undefined {
    const capacity = this.enrollmentStore.getCapacity(courseId)
    const enrolledCount = this.enrollmentStore.getEnrolledCount(courseId)

    // null capacity = unlimited → always promote
    // otherwise promote only if enrolled < capacity
    if (capacity !== null && enrolledCount >= capacity) return undefined

    const head = this.waitlistStore.popHead(courseId)
    if (!head) return undefined

    this.enrollmentStore.enroll(head.userId, courseId)
    this.notificationsStore.create({
      category: 'task',
      type: 'success',
      title: "You're enrolled!",
      message: `You have been enrolled in course ${courseId}.`,
    })
    return head.userId
  }
}
