import { describe, it, expect, beforeEach } from 'vitest'
import { EnrollmentStore } from '../collections/EnrollmentStore'
import { NotificationsStore } from '../collections/NotificationsStore'
import { WaitlistStore } from '../collections/WaitlistStore'
import { EnrollmentService } from './enrollmentService'

describe('EnrollmentService', () => {
  let enrollmentStore: EnrollmentStore
  let waitlistStore: WaitlistStore
  let notificationsStore: NotificationsStore
  let service: EnrollmentService

  beforeEach(() => {
    enrollmentStore = new EnrollmentStore()
    waitlistStore = new WaitlistStore()
    notificationsStore = new NotificationsStore()
    service = new EnrollmentService(enrollmentStore, waitlistStore, notificationsStore)
  })

  // Helper: count notifications of category 'task' and type 'success'
  const taskSuccessCount = () =>
    notificationsStore
      .getAll()
      .filter((n) => n.category === 'task' && n.type === 'success').length

  // -------------------------------------------------------------------------
  // Edge case 1 — Idempotent: second enrollment returns 'already-enrolled',
  // no duplicate notification.
  // -------------------------------------------------------------------------
  it('edge case 1: enrolling the same user twice returns already-enrolled and fires no extra notification', () => {
    service.requestEnrollment('user-1', 'course-1')
    expect(taskSuccessCount()).toBe(0)

    const result = service.requestEnrollment('user-1', 'course-1')
    expect(result.kind).toBe('already-enrolled')
    expect(taskSuccessCount()).toBe(0) // still 0 — no notification
  })

  // -------------------------------------------------------------------------
  // Edge case 2 — Waitlist position: N users fill a course of size N; the
  // (N+1)th gets position 1, the (N+2)th gets position 2.
  // -------------------------------------------------------------------------
  it('edge case 2: (N+1)th user is waitlisted at position 1, (N+2)th at position 2', () => {
    const N = 3
    for (let i = 1; i <= N; i++) {
      enrollmentStore.setCapacity('course-1', N)
      service.requestEnrollment(`user-${i}`, 'course-1')
    }

    // 4th user
    const r4 = service.requestEnrollment('user-4', 'course-1')
    expect(r4.kind).toBe('waitlisted')
    expect((r4 as { kind: 'waitlisted'; entry: { position: number } }).entry.position).toBe(1)

    // 5th user
    const r5 = service.requestEnrollment('user-5', 'course-1')
    expect(r5.kind).toBe('waitlisted')
    expect((r5 as { kind: 'waitlisted'; entry: { position: number } }).entry.position).toBe(2)
  })

  // -------------------------------------------------------------------------
  // Edge case 3 — Withdrawing from waitlist does NOT promote anyone.
  // -------------------------------------------------------------------------
  it('edge case 3: withdrawing from waitlist returns left-waitlist and does not promote', () => {
    enrollmentStore.setCapacity('course-1', 1)
    service.requestEnrollment('user-1', 'course-1') // enrolled
    service.requestEnrollment('user-2', 'course-1') // waitlisted at position 1
    service.requestEnrollment('user-3', 'course-1') // waitlisted at position 2

    const result = service.withdraw('user-2', 'course-1')
    expect(result.kind).toBe('left-waitlist')

    // user-3 should still be at position 1
    const queue = waitlistStore.getQueueForCourse('course-1')
    expect(queue).toHaveLength(1)
    expect(queue[0].userId).toBe('user-3')
    expect(queue[0].position).toBe(1)
  })

  // -------------------------------------------------------------------------
  // Edge case 4 — Enrolled user withdraws → top of waitlist promoted with
  // notification; promotedUserId surfaced in result.
  // -------------------------------------------------------------------------
  it('edge case 4: enrolled withdraw promotes top waitlister and creates one notification', () => {
    enrollmentStore.setCapacity('course-1', 1)
    service.requestEnrollment('user-1', 'course-1') // enrolled
    service.requestEnrollment('user-2', 'course-1') // waitlisted

    expect(taskSuccessCount()).toBe(0)

    const result = service.withdraw('user-1', 'course-1')
    expect(result.kind).toBe('unenrolled')
    expect((result as { promotedUserId?: string }).promotedUserId).toBe('user-2')

    expect(enrollmentStore.isEnrolled('user-2', 'course-1')).toBe(true)
    expect(enrollmentStore.isEnrolled('user-1', 'course-1')).toBe(false)
    expect(taskSuccessCount()).toBe(1)

    const notif = notificationsStore.getAll().find((n) => n.category === 'task')
    expect(notif?.title).toBe("You're enrolled!")
    expect(notif?.message).toContain('course-1')
  })

  // -------------------------------------------------------------------------
  // Edge case 5 — Withdrawing a non-present user returns 'not-present' without error.
  // -------------------------------------------------------------------------
  it('edge case 5: withdrawing a user who is neither enrolled nor waitlisted returns not-present', () => {
    const result = service.withdraw('ghost', 'course-1')
    expect(result.kind).toBe('not-present')
  })

  // -------------------------------------------------------------------------
  // Edge case 6 — Lowering capacity below current enrolled count: no kicks,
  // subsequent enrollment requests go to waitlist.
  // -------------------------------------------------------------------------
  it('edge case 6: lowering capacity below enrolled count does not kick anyone', () => {
    enrollmentStore.setCapacity('course-1', 5)
    for (let i = 1; i <= 5; i++) {
      service.requestEnrollment(`user-${i}`, 'course-1')
    }

    // Reduce capacity below current enrolled count
    const { promoted } = service.setCourseCapacity('course-1', 2)
    expect(promoted).toHaveLength(0)

    // All 5 are still enrolled
    for (let i = 1; i <= 5; i++) {
      expect(enrollmentStore.isEnrolled(`user-${i}`, 'course-1')).toBe(true)
    }

    // New enrollment goes to waitlist
    const result = service.requestEnrollment('user-99', 'course-1')
    expect(result.kind).toBe('waitlisted')
  })

  // -------------------------------------------------------------------------
  // Edge case 7 — Raise capacity by 3 with 5 waitlisters → 3 promoted in FIFO
  // order, 3 notifications fired, waitlist now has 2 left.
  // -------------------------------------------------------------------------
  it('edge case 7: raising capacity promotes exactly min(delta, waitlistSize) users in FIFO order', () => {
    enrollmentStore.setCapacity('course-1', 2)
    service.requestEnrollment('user-1', 'course-1')
    service.requestEnrollment('user-2', 'course-1')

    // Add 5 waitlisters
    for (let i = 3; i <= 7; i++) {
      service.requestEnrollment(`user-${i}`, 'course-1')
    }

    expect(taskSuccessCount()).toBe(0)

    const { promoted } = service.setCourseCapacity('course-1', 5)
    expect(promoted).toHaveLength(3)
    expect(promoted).toEqual(['user-3', 'user-4', 'user-5']) // FIFO order

    expect(taskSuccessCount()).toBe(3)

    // user-6 and user-7 should still be on waitlist
    const queue = waitlistStore.getQueueForCourse('course-1')
    expect(queue).toHaveLength(2)
    expect(queue[0].userId).toBe('user-6')
    expect(queue[1].userId).toBe('user-7')

    // All 5 enrolled
    for (let i = 1; i <= 5; i++) {
      expect(enrollmentStore.isEnrolled(`user-${i}`, 'course-1')).toBe(true)
    }
  })

  // -------------------------------------------------------------------------
  // Edge case 8 — Raise capacity to a number larger than waitlist size →
  // promote all, waitlist empty, only waitlistLength notifications.
  // -------------------------------------------------------------------------
  it('edge case 8: raising capacity above waitlist size promotes all waitlisters', () => {
    enrollmentStore.setCapacity('course-1', 1)
    service.requestEnrollment('user-1', 'course-1')
    for (let i = 2; i <= 4; i++) {
      service.requestEnrollment(`user-${i}`, 'course-1')
    } // 3 on waitlist

    const { promoted } = service.setCourseCapacity('course-1', 10)
    expect(promoted).toHaveLength(3)
    expect(taskSuccessCount()).toBe(3)
    expect(waitlistStore.getQueueForCourse('course-1')).toHaveLength(0)
  })

  // -------------------------------------------------------------------------
  // Edge case 9 — Unlimited capacity (null): requestEnrollment never waitlists;
  // setCourseCapacity to a number then back to null promotes all current waitlisters.
  // -------------------------------------------------------------------------
  it('edge case 9a: unlimited capacity never waitlists', () => {
    enrollmentStore.setCapacity('course-1', null)
    for (let i = 1; i <= 20; i++) {
      const result = service.requestEnrollment(`user-${i}`, 'course-1')
      expect(result.kind).toBe('enrolled')
    }
    expect(waitlistStore.getQueueForCourse('course-1')).toHaveLength(0)
  })

  it('edge case 9b: setting capacity to null after a number promotes all remaining waitlisters', () => {
    enrollmentStore.setCapacity('course-1', 1)
    service.requestEnrollment('user-1', 'course-1')
    for (let i = 2; i <= 4; i++) {
      service.requestEnrollment(`user-${i}`, 'course-1')
    } // 3 on waitlist

    const { promoted } = service.setCourseCapacity('course-1', null)
    expect(promoted).toHaveLength(3)
    expect(taskSuccessCount()).toBe(3)
    expect(waitlistStore.getQueueForCourse('course-1')).toHaveLength(0)
    expect(enrollmentStore.getEnrolledCount('course-1')).toBe(4)
  })

  // -------------------------------------------------------------------------
  // Edge case 10 — Capacity = 0: all requests waitlist; existing enrollments
  // stay; withdrawals do NOT promote (no seats).
  // -------------------------------------------------------------------------
  it('edge case 10: capacity 0 queues everyone, existing enrollments stay, withdrawals do not promote', () => {
    enrollmentStore.setCapacity('course-1', 0)

    // First user → waitlisted (0 seats available)
    const r1 = service.requestEnrollment('user-1', 'course-1')
    expect(r1.kind).toBe('waitlisted')

    // user-1 now enrolled some other way (e.g., service bypass for instructors)
    enrollmentStore.enroll('user-2', 'course-1')

    // user-2 withdraws — should NOT promote user-1 because capacity is 0
    const result = service.withdraw('user-2', 'course-1')
    expect(result.kind).toBe('unenrolled')
    expect((result as { promotedUserId?: string }).promotedUserId).toBeUndefined()
    expect(taskSuccessCount()).toBe(0)

    // user-1 is still waitlisted
    expect(waitlistStore.getEntry('user-1', 'course-1') !== null).toBe(true)
  })

  // -------------------------------------------------------------------------
  // Additional invariant checks
  // -------------------------------------------------------------------------

  it('no-duplicates invariant: a user is in exactly one state per course at all times', () => {
    enrollmentStore.setCapacity('course-1', 1)
    service.requestEnrollment('user-1', 'course-1')
    service.requestEnrollment('user-1', 'course-1') // already-enrolled
    service.withdraw('user-1', 'course-1')
    service.requestEnrollment('user-1', 'course-1') // enrolled again

    // user-1 should be enrolled and NOT waitlisted
    expect(enrollmentStore.isEnrolled('user-1', 'course-1')).toBe(true)
    expect(waitlistStore.getEntry('user-1', 'course-1')).toBeNull()
  })

  it('auto-promotion on withdraw: user is promoted and removed from waitlist atomically', () => {
    enrollmentStore.setCapacity('course-1', 1)
    service.requestEnrollment('user-1', 'course-1') // enrolled
    service.requestEnrollment('user-2', 'course-1') // waitlisted

    service.withdraw('user-1', 'course-1')

    expect(waitlistStore.getEntry('user-2', 'course-1')).toBeNull() // removed from waitlist
    expect(enrollmentStore.isEnrolled('user-2', 'course-1')).toBe(true) // now enrolled
  })

  it('auto-promotion on capacity increase: promoted users appear in enrollment store', () => {
    enrollmentStore.setCapacity('course-1', 1)
    service.requestEnrollment('user-1', 'course-1')
    service.requestEnrollment('user-2', 'course-1')
    service.requestEnrollment('user-3', 'course-1')

    service.setCourseCapacity('course-1', 3)

    expect(enrollmentStore.isEnrolled('user-1', 'course-1')).toBe(true)
    expect(enrollmentStore.isEnrolled('user-2', 'course-1')).toBe(true)
    expect(enrollmentStore.isEnrolled('user-3', 'course-1')).toBe(true)
  })

  it('idempotent waitlist add: calling requestEnrollment while already waitlisted returns already-waitlisted and fires no notification', () => {
    enrollmentStore.setCapacity('course-1', 1)
    service.requestEnrollment('user-1', 'course-1')
    service.requestEnrollment('user-2', 'course-1') // waitlisted

    expect(taskSuccessCount()).toBe(0)
    const result = service.requestEnrollment('user-2', 'course-1')
    expect(result.kind).toBe('already-waitlisted')
    expect(taskSuccessCount()).toBe(0)
  })

  it('setCourseCapacity returns promoted userIds in order', () => {
    enrollmentStore.setCapacity('course-1', 0)
    service.requestEnrollment('user-1', 'course-1')
    service.requestEnrollment('user-2', 'course-1')
    service.requestEnrollment('user-3', 'course-1')

    const { promoted } = service.setCourseCapacity('course-1', 3)
    expect(promoted).toEqual(['user-1', 'user-2', 'user-3'])
  })
})
