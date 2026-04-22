import { describe, it, expect, beforeEach } from 'vitest'
import { WaitlistStore } from './WaitlistStore'

describe('WaitlistStore', () => {
  let store: WaitlistStore

  beforeEach(() => {
    store = new WaitlistStore()
  })

  describe('add', () => {
    it('should add a user to the waitlist', async () => {
      const entry = store.add('user-1', 'course-1')
      expect(entry.userId).toBe('user-1')
      expect(entry.courseId).toBe('course-1')
      expect(entry.joinedAt).toBeInstanceOf(Date)
    })

    it('should be idempotent — returning existing entry on duplicate add', async () => {
      const e1 = store.add('user-1', 'course-1')
      await new Promise((r) => setTimeout(r, 5))
      const e2 = store.add('user-1', 'course-1')
      expect(e2.userId).toBe(e1.userId)
      expect(e2.courseId).toBe(e1.courseId)
      expect(e2.joinedAt).toEqual(e1.joinedAt)
    })

    it('should allow the same user to be on different course waitlists', async () => {
      store.add('user-1', 'course-1')
      await new Promise((r) => setTimeout(r, 5))
      const entry = store.add('user-1', 'course-2')
      expect(entry.courseId).toBe('course-2')
    })
  })

  describe('remove', () => {
    it('should remove an existing entry and return true', () => {
      store.add('user-1', 'course-1')
      expect(store.remove('user-1', 'course-1')).toBe(true)
      expect(store.getEntry('user-1', 'course-1')).toBeNull()
    })

    it('should return false when removing a non-present user', () => {
      expect(store.remove('ghost', 'course-1')).toBe(false)
    })

    it('should return false when removing from a course with no waitlist', () => {
      expect(store.remove('user-1', 'nonexistent')).toBe(false)
    })
  })

  describe('popHead', () => {
    it('should return null when the waitlist is empty', () => {
      expect(store.popHead('course-1')).toBeNull()
    })

    it('should return the only entry and empty the waitlist', () => {
      store.add('user-1', 'course-1')
      const head = store.popHead('course-1')
      expect(head?.userId).toBe('user-1')
      expect(store.popHead('course-1')).toBeNull()
    })

    it('should return entries in FIFO order by joinedAt', async () => {
      store.add('user-early', 'course-1')
      await new Promise((r) => setTimeout(r, 10))
      store.add('user-late', 'course-1')
      const head = store.popHead('course-1')
      expect(head?.userId).toBe('user-early')
      // Second pop should be the late entry
      const second = store.popHead('course-1')
      expect(second?.userId).toBe('user-late')
    })

    it('should break ties by userId lexicographic order', () => {
      // We need entries with the same joinedAt timestamp.
      // Insert directly into the internal map to control joinedAt precisely.
      const fakeDate = new Date(2026, 0, 1, 12, 0, 0)
      // @ts-expect-error — accessing private field for test isolation
      const byCourse = store.byCourse as Map<string, Map<string, { userId: string; courseId: string; joinedAt: Date; position: number }>>
      if (!byCourse.has('course-1')) byCourse.set('course-1', new Map())
      const map = byCourse.get('course-1')!
      map.set('user-z', { userId: 'user-z', courseId: 'course-1', joinedAt: new Date(fakeDate), position: 1 })
      map.set('user-a', { userId: 'user-a', courseId: 'course-1', joinedAt: new Date(fakeDate), position: 1 })

      const head = store.popHead('course-1')
      expect(head?.userId).toBe('user-a') // 'user-a' < 'user-z' lexicographically
    })
  })

  describe('getEntry', () => {
    it('should return the entry for an existing user/course pair', () => {
      store.add('user-1', 'course-1')
      const entry = store.getEntry('user-1', 'course-1')
      expect(entry?.userId).toBe('user-1')
      expect(entry?.courseId).toBe('course-1')
    })

    it('should return null if user is not on the waitlist for that course', () => {
      store.add('user-1', 'course-1')
      expect(store.getEntry('user-2', 'course-1')).toBeNull()
    })

    it('should return null if user is on a different course waitlist', () => {
      store.add('user-1', 'course-1')
      expect(store.getEntry('user-1', 'course-2')).toBeNull()
    })
  })

  describe('getQueueForCourse', () => {
    it('should return empty array for a course with no waitlist', () => {
      expect(store.getQueueForCourse('course-1')).toEqual([])
    })

    it('should return entries sorted by joinedAt asc with positions filled 1..N', async () => {
      store.add('user-first', 'course-1')
      await new Promise((r) => setTimeout(r, 10))
      store.add('user-second', 'course-1')
      await new Promise((r) => setTimeout(r, 10))
      store.add('user-third', 'course-1')

      const queue = store.getQueueForCourse('course-1')
      expect(queue).toHaveLength(3)
      expect(queue[0].userId).toBe('user-first')
      expect(queue[0].position).toBe(1)
      expect(queue[1].userId).toBe('user-second')
      expect(queue[1].position).toBe(2)
      expect(queue[2].userId).toBe('user-third')
      expect(queue[2].position).toBe(3)
    })

    it('should reflect position changes after a removal', async () => {
      store.add('user-first', 'course-1')
      await new Promise((r) => setTimeout(r, 5))
      store.add('user-second', 'course-1')
      await new Promise((r) => setTimeout(r, 5))
      store.add('user-third', 'course-1')

      store.remove('user-first', 'course-1')
      const queue = store.getQueueForCourse('course-1')
      expect(queue).toHaveLength(2)
      expect(queue[0].userId).toBe('user-second')
      expect(queue[0].position).toBe(1)
      expect(queue[1].userId).toBe('user-third')
      expect(queue[1].position).toBe(2)
    })
  })

  describe('getQueuesForUser', () => {
    it('should return empty array for a user not on any waitlist', () => {
      expect(store.getQueuesForUser('ghost')).toEqual([])
    })

    it('should return all entries for a user across multiple courses', async () => {
      store.add('user-1', 'course-1')
      await new Promise((r) => setTimeout(r, 5))
      store.add('user-1', 'course-2')
      await new Promise((r) => setTimeout(r, 5))
      store.add('user-2', 'course-1')

      const entries = store.getQueuesForUser('user-1')
      expect(entries).toHaveLength(2)
      expect(entries.map((e) => e.courseId).sort()).toEqual(['course-1', 'course-2'])
    })

    it('should recompute position per course', async () => {
      store.add('user-1', 'course-1')
      await new Promise((r) => setTimeout(r, 5))
      store.add('user-1', 'course-1')
      await new Promise((r) => setTimeout(r, 5))
      store.add('user-other', 'course-1')
      await new Promise((r) => setTimeout(r, 5))
      store.add('user-1', 'course-2')

      const entries = store.getQueuesForUser('user-1')
      // user-1 is first in course-1 (after waitlist reorder: first add = first, second add = second, other = third)
      // Wait: user-1 added twice and user-other once. Sorted: user-1(1), user-1(2), user-other(3)
      // First user-1 entry has position 1
      const course1Entry = entries.find((e) => e.courseId === 'course-1')
      expect(course1Entry?.position).toBe(1)
    })
  })
})
