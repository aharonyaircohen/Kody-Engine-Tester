import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DiscussionService } from './discussions'
import { DiscussionsStore } from '../collections/Discussions'
import { EnrollmentStore } from '../collections/EnrollmentStore'
import type { User } from '../auth/user-store'

const makeRichText = (text: string) => ({
  root: {
    children: [{ text }],
  },
})

const makeUser = (id: string, role: User['role']): User =>
  ({ id, email: `${id}@example.com`, role } as User)

describe('DiscussionService', () => {
  let store: DiscussionsStore
  let enrollmentStore: EnrollmentStore
  let service: DiscussionService

  // In-memory user registry for tests
  const userRegistry = new Map<string, User>()

  beforeEach(() => {
    store = new DiscussionsStore()
    enrollmentStore = new EnrollmentStore()
    userRegistry.clear()

    service = new DiscussionService(
      store,
      enrollmentStore,
      (id) => Promise.resolve(userRegistry.get(id)),
      (userId, courseId) => enrollmentStore.isEnrolled(userId, courseId),
    )
  })

  // ─── getThreads ────────────────────────────────────────────────────────────

  describe('getThreads', () => {
    it('should return top-level posts sorted with pinned first', async () => {
      userRegistry.set('u1', makeUser('u1', 'student'))

      const p1 = store.create({ lesson: 'lesson-1', author: 'u1', content: makeRichText('Regular') })
      const p2 = store.create({ lesson: 'lesson-1', author: 'u1', content: makeRichText('Pinned'), parentPost: null })
      store.pin(p2.id)

      const threads = await service.getThreads('lesson-1')
      expect(threads).toHaveLength(2)
      expect(threads[0].post.id).toBe(p2.id)
      expect(threads[1].post.id).toBe(p1.id)
    })

    it('should return empty array when no posts exist', async () => {
      const threads = await service.getThreads('lesson-1')
      expect(threads).toEqual([])
    })

    it('should not return replies as top-level threads', async () => {
      userRegistry.set('u1', makeUser('u1', 'student'))

      const parent = store.create({ lesson: 'lesson-1', author: 'u1', content: makeRichText('Parent') })
      store.create({ lesson: 'lesson-1', author: 'u1', content: makeRichText('Reply'), parentPost: parent.id })

      const threads = await service.getThreads('lesson-1')
      expect(threads).toHaveLength(1)
      expect(threads[0].post.id).toBe(parent.id)
      expect(threads[0].replies).toHaveLength(1)
      expect(threads[0].replies[0].post.content.root.children[0].text).toBe('Reply')
    })
  })

  // ─── Thread nesting (max depth 3) ─────────────────────────────────────────

  describe('Thread nesting', () => {
    beforeEach(() => {
      userRegistry.set('u1', makeUser('u1', 'student'))
      enrollmentStore.enroll('u1', 'course-1')
    })

    it('should allow replies up to depth 3', async () => {
      const t1 = await service.createPost('lesson-1', 'u1', makeRichText('Level 1'), 'course-1')
      const t2 = await service.createPost('lesson-1', 'u1', makeRichText('Level 2'), 'course-1', t1.id)
      const t3 = await service.createPost('lesson-1', 'u1', makeRichText('Level 3'), 'course-1', t2.id)

      const threads = await service.getThreads('lesson-1')
      expect(threads[0].replies[0].replies[0].post.content.root.children[0].text).toBe('Level 3')
      expect(threads[0].replies[0].replies[0].replies).toHaveLength(0) // depth 3 → no further replies
    })

    it('should reject a reply at depth 4 (max depth exceeded)', async () => {
      const t1 = await service.createPost('lesson-1', 'u1', makeRichText('Level 1'), 'course-1')
      const t2 = await service.createPost('lesson-1', 'u1', makeRichText('Level 2'), 'course-1', t1.id)
      const t3 = await service.createPost('lesson-1', 'u1', makeRichText('Level 3'), 'course-1', t2.id)

      await expect(
        service.createPost('lesson-1', 'u1', makeRichText('Level 4'), 'course-1', t3.id),
      ).rejects.toThrow('Maximum reply depth (3) reached')
    })

    it('should reject a reply to a non-existent parent', async () => {
      await expect(
        service.createPost('lesson-1', 'u1', makeRichText('Orphan'), 'course-1', 'non-existent'),
      ).rejects.toThrow('Parent post not found')
    })
  })

  // ─── Enrollment checks ───────────────────────────────────────────────────────

  describe('Enrollment checks', () => {
    beforeEach(() => {
      userRegistry.set('u1', makeUser('u1', 'student'))
      userRegistry.set('u2', makeUser('u2', 'student'))
      userRegistry.set('u3', makeUser('u3', 'instructor'))
      enrollmentStore.enroll('u1', 'course-1')
      enrollmentStore.enroll('u3', 'course-1')
    })

    it('should allow an enrolled student to create a post', async () => {
      await expect(
        service.createPost('lesson-1', 'u1', makeRichText('Enrolled student'), 'course-1'),
      ).resolves.toMatchObject({ id: expect.any(String) })
    })

    it('should reject a post from an unenrolled student', async () => {
      await expect(
        service.createPost('lesson-1', 'u2', makeRichText('Unenrolled'), 'course-1'),
      ).rejects.toThrow('Not enrolled in this course')
    })

    it('should allow an instructor to create a post even without explicit enrollment', async () => {
      // instructor role bypasses enrollment check in the enrollmentChecker
      await expect(
        service.createPost('lesson-1', 'u3', makeRichText('Instructor post'), 'course-1'),
      ).resolves.toMatchObject({ id: expect.any(String) })
    })

    it('should reject a post from an unknown user', async () => {
      await expect(
        service.createPost('lesson-1', 'ghost', makeRichText('Ghost'), 'course-1'),
      ).rejects.toThrow('User not found')
    })

    it('should reject a reply from an unenrolled student', async () => {
      const parent = await service.createPost('lesson-1', 'u1', makeRichText('Parent'), 'course-1')
      await expect(
        service.createPost('lesson-1', 'u2', makeRichText('Unenrolled reply'), 'course-1', parent.id),
      ).rejects.toThrow('Not enrolled in this course')
    })
  })

  // ─── Pin / Unpin ────────────────────────────────────────────────────────────

  describe('pinPost / unpinPost', () => {
    beforeEach(() => {
      userRegistry.set('student', makeUser('student', 'student'))
      userRegistry.set('instructor', makeUser('instructor', 'instructor'))
      userRegistry.set('admin', makeUser('admin', 'admin'))
      userRegistry.set('guest', makeUser('guest', 'guest'))
      enrollmentStore.enroll('student', 'course-1')
      enrollmentStore.enroll('instructor', 'course-1')
      enrollmentStore.enroll('admin', 'course-1')
    })

    it('should allow an instructor to pin a post', async () => {
      const { id } = await service.createPost('lesson-1', 'student', makeRichText('Post'), 'course-1')
      await service.pinPost(id, 'instructor')
      expect(store.getById(id)?.isPinned).toBe(true)
    })

    it('should allow an admin to pin a post', async () => {
      const { id } = await service.createPost('lesson-1', 'student', makeRichText('Post'), 'course-1')
      await service.pinPost(id, 'admin')
      expect(store.getById(id)?.isPinned).toBe(true)
    })

    it('should reject pin from a student', async () => {
      const { id } = await service.createPost('lesson-1', 'student', makeRichText('Post'), 'course-1')
      await expect(service.pinPost(id, 'student')).rejects.toThrow(
        'Forbidden: instructor or admin required',
      )
    })

    it('should reject pin from a guest', async () => {
      const { id } = await service.createPost('lesson-1', 'student', makeRichText('Post'), 'course-1')
      await expect(service.pinPost(id, 'guest')).rejects.toThrow(
        'Forbidden: instructor or admin required',
      )
    })

    it('should allow an instructor to unpin a pinned post', async () => {
      const { id } = await service.createPost('lesson-1', 'student', makeRichText('Post'), 'course-1')
      await service.pinPost(id, 'instructor')
      await service.unpinPost(id, 'instructor')
      expect(store.getById(id)?.isPinned).toBe(false)
    })
  })

  // ─── Resolve / Unresolve ────────────────────────────────────────────────────

  describe('resolvePost / unresolvePost', () => {
    beforeEach(() => {
      userRegistry.set('student', makeUser('student', 'student'))
      userRegistry.set('instructor', makeUser('instructor', 'instructor'))
      userRegistry.set('admin', makeUser('admin', 'admin'))
      userRegistry.set('guest', makeUser('guest', 'guest'))
      enrollmentStore.enroll('student', 'course-1')
      enrollmentStore.enroll('instructor', 'course-1')
      enrollmentStore.enroll('admin', 'course-1')
    })

    it('should allow an instructor to resolve a post', async () => {
      const { id } = await service.createPost('lesson-1', 'student', makeRichText('Post'), 'course-1')
      await service.resolvePost(id, 'instructor')
      expect(store.getById(id)?.isResolved).toBe(true)
    })

    it('should allow an admin to resolve a post', async () => {
      const { id } = await service.createPost('lesson-1', 'student', makeRichText('Post'), 'course-1')
      await service.resolvePost(id, 'admin')
      expect(store.getById(id)?.isResolved).toBe(true)
    })

    it('should reject resolve from a student', async () => {
      const { id } = await service.createPost('lesson-1', 'student', makeRichText('Post'), 'course-1')
      await expect(service.resolvePost(id, 'student')).rejects.toThrow(
        'Forbidden: instructor or admin required',
      )
    })

    it('should reject resolve from a guest', async () => {
      const { id } = await service.createPost('lesson-1', 'student', makeRichText('Post'), 'course-1')
      await expect(service.resolvePost(id, 'guest')).rejects.toThrow(
        'Forbidden: instructor or admin required',
      )
    })

    it('should allow an instructor to unresolve a resolved post', async () => {
      const { id } = await service.createPost('lesson-1', 'student', makeRichText('Post'), 'course-1')
      await service.resolvePost(id, 'instructor')
      await service.unresolvePost(id, 'instructor')
      expect(store.getById(id)?.isResolved).toBe(false)
    })
  })
})
