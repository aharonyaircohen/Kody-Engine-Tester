import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DiscussionService } from './discussions'
import { DiscussionsStore } from '../collections/Discussions'
import { EnrollmentStore } from '../collections/EnrollmentStore'
import type { MinimalUser } from './discussions'
import type { RbacRole } from '../auth/auth-service'

const makeRichText = (text: string) => ({
  root: {
    children: [{ text }],
  },
})

const makeUser = (id: string, role: RbacRole): MinimalUser =>
  ({ id, email: `${id}@example.com`, role, isActive: true })

describe('DiscussionService', () => {
  let store: DiscussionsStore
  let enrollmentStore: EnrollmentStore
  let service: DiscussionService

  // In-memory user registry for tests
  const userRegistry = new Map<string, MinimalUser>()

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
      expect(threads[0].replyCount).toBe(0)
      expect(threads[1].replyCount).toBe(0)
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
      expect(threads[0].replyCount).toBe(1)
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
      expect(threads[0].replyCount).toBe(1)
      expect(threads[0].replies[0].replyCount).toBe(1)
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
      userRegistry.set('guest', makeUser('guest', 'viewer'))
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

    it('should reject pin from a viewer', async () => {
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
      userRegistry.set('guest', makeUser('guest', 'viewer'))
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

  // ─── editPost ────────────────────────────────────────────────────────────────

  describe('editPost', () => {
    beforeEach(() => {
      userRegistry.set('author', makeUser('author', 'student'))
      userRegistry.set('other', makeUser('other', 'student'))
      enrollmentStore.enroll('author', 'course-1')
      enrollmentStore.enroll('other', 'course-1')
    })

    it('should allow a post author to edit their content', async () => {
      const { id } = await service.createPost('lesson-1', 'author', makeRichText('Original'), 'course-1')
      await service.editPost(id, 'author', makeRichText('Edited content'))
      expect(store.getById(id)?.content.root.children[0].text).toBe('Edited content')
    })

    it('should reject edit from a non-author', async () => {
      const { id } = await service.createPost('lesson-1', 'author', makeRichText('Original'), 'course-1')
      await expect(service.editPost(id, 'other', makeRichText('Hacked'))).rejects.toThrow(
        'Forbidden: you can only edit your own posts',
      )
    })

    it('should throw for a non-existent post', async () => {
      await expect(service.editPost('nonexistent', 'author', makeRichText('X'))).rejects.toThrow(
        'Post not found',
      )
    })

    it('should throw for a soft-deleted post', async () => {
      const { id } = await service.createPost('lesson-1', 'author', makeRichText('Original'), 'course-1')
      store.softDelete(id)
      await expect(service.editPost(id, 'author', makeRichText('X'))).rejects.toThrow('Post not found')
    })
  })

  // ─── deletePost ──────────────────────────────────────────────────────────────

  describe('deletePost', () => {
    beforeEach(() => {
      userRegistry.set('author', makeUser('author', 'student'))
      userRegistry.set('other', makeUser('other', 'student'))
      userRegistry.set('instructor', makeUser('instructor', 'instructor'))
      userRegistry.set('admin', makeUser('admin', 'admin'))
      enrollmentStore.enroll('author', 'course-1')
      enrollmentStore.enroll('other', 'course-1')
      enrollmentStore.enroll('instructor', 'course-1')
    })

    it('should soft-delete an author own post', async () => {
      const { id } = await service.createPost('lesson-1', 'author', makeRichText('My post'), 'course-1')
      await service.deletePost(id, 'author', 'student')
      expect(store.getById(id)?.isDeleted).toBe(true)
    })

    it('should reject delete from a non-author instructor', async () => {
      const { id } = await service.createPost('lesson-1', 'author', makeRichText('Other post'), 'course-1')
      await expect(service.deletePost(id, 'instructor', 'instructor')).rejects.toThrow(
        'Forbidden: you can only delete your own posts',
      )
    })

    it('should allow an admin to delete any post', async () => {
      const { id } = await service.createPost('lesson-1', 'author', makeRichText('Admin post'), 'course-1')
      await service.deletePost(id, 'admin', 'admin')
      expect(store.getById(id)?.isDeleted).toBe(true)
    })

    it('should reject delete from a non-author student', async () => {
      const { id } = await service.createPost('lesson-1', 'author', makeRichText('Other post'), 'course-1')
      await expect(service.deletePost(id, 'other', 'student')).rejects.toThrow(
        'Forbidden: you can only delete your own posts',
      )
    })

    it('should throw for a non-existent post', async () => {
      await expect(service.deletePost('nonexistent', 'author', 'student')).rejects.toThrow('Post not found')
    })

    it('should throw for an already-deleted post', async () => {
      const { id } = await service.createPost('lesson-1', 'author', makeRichText('Gone'), 'course-1')
      store.softDelete(id)
      await expect(service.deletePost(id, 'author', 'student')).rejects.toThrow('Post not found')
    })
  })

  // ─── Notification trigger on reply ─────────────────────────────────────────

  describe('Notification on reply', () => {
    let mockNotificationService: any

    beforeEach(() => {
      userRegistry.set('author', makeUser('author', 'student'))
      userRegistry.set('replier', makeUser('replier', 'student'))
      enrollmentStore.enroll('author', 'course-1')
      enrollmentStore.enroll('replier', 'course-1')

      mockNotificationService = {
        notify: vi.fn().mockResolvedValue({ id: 'n1' }),
      }

      service = new DiscussionService(
        store,
        enrollmentStore,
        (id) => Promise.resolve(userRegistry.get(id)),
        (userId, courseId) => enrollmentStore.isEnrolled(userId, courseId),
        mockNotificationService,
      )
    })

    it('should NOT notify when creating a top-level post', async () => {
      await service.createPost('lesson-1', 'author', makeRichText('First post'), 'course-1')
      expect(mockNotificationService.notify).not.toHaveBeenCalled()
    })

    it('should notify the parent post author on reply', async () => {
      const parent = await service.createPost('lesson-1', 'author', makeRichText('Original'), 'course-1')
      await service.createPost('lesson-1', 'replier', makeRichText('My reply here'), 'course-1', parent.id)

      expect(mockNotificationService.notify).toHaveBeenCalledTimes(1)
      const [notifiedUserId, type, title, message, link] = mockNotificationService.notify.mock.calls[0]
      expect(notifiedUserId).toBe('author')
      expect(type).toBe('discussion_reply')
      expect(title).toBe('New reply to your post')
      expect(message).toContain('My reply here')
      expect(link).toMatch(/^\/discussions\/[\w-]+$/)
    })

    it('should NOT notify when replying to own post', async () => {
      const parent = await service.createPost('lesson-1', 'author', makeRichText('My post'), 'course-1')
      await service.createPost('lesson-1', 'author', makeRichText('My reply'), 'course-1', parent.id)
      expect(mockNotificationService.notify).not.toHaveBeenCalled()
    })

    it('should NOT notify on edit (only on reply)', async () => {
      const { id } = await service.createPost('lesson-1', 'author', makeRichText('Original'), 'course-1')
      await service.createPost('lesson-1', 'author', makeRichText('Another post'), 'course-1')
      await service.editPost(id, 'author', makeRichText('Edited'))
      expect(mockNotificationService.notify).not.toHaveBeenCalled()
    })

    it('should notify with correct deep link to the new reply', async () => {
      const parent = await service.createPost('lesson-1', 'author', makeRichText('Original'), 'course-1')
      const reply = await service.createPost(
        'lesson-1',
        'replier',
        makeRichText('My reply here'),
        'course-1',
        parent.id,
      )
      expect(mockNotificationService.notify).toHaveBeenCalledWith(
        'author',
        'discussion_reply',
        'New reply to your post',
        expect.stringContaining('My reply here'),
        `/discussions/${reply.id}`,
      )
    })
  })

  // ─── getThread ───────────────────────────────────────────────────────────────

  describe('getThread', () => {
    beforeEach(() => {
      userRegistry.set('u1', makeUser('u1', 'student'))
      enrollmentStore.enroll('u1', 'course-1')
    })

    it('should return the thread with replies', async () => {
      const parent = await service.createPost('lesson-1', 'u1', makeRichText('Parent'), 'course-1')
      await service.createPost('lesson-1', 'u1', makeRichText('Reply 1'), 'course-1', parent.id)

      const thread = await service.getThread(parent.id)
      expect(thread).not.toBeNull()
      expect(thread!.post.id).toBe(parent.id)
      expect(thread!.replies).toHaveLength(1)
      expect(thread!.replyCount).toBe(1)
    })

    it('should return null for non-existent post', async () => {
      const thread = await service.getThread('nonexistent')
      expect(thread).toBeNull()
    })

    it('should return null for a soft-deleted post', async () => {
      const { id } = await service.createPost('lesson-1', 'u1', makeRichText('Gone'), 'course-1')
      store.softDelete(id)
      const thread = await service.getThread(id)
      expect(thread).toBeNull()
    })
  })
})
