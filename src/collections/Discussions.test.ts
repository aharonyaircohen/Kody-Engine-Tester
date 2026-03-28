import { describe, it, expect, beforeEach } from 'vitest'
import { DiscussionsStore } from './Discussions'

const makeRichText = (text: string) => ({
  root: { children: [{ text }] },
})

describe('DiscussionsStore', () => {
  let store: DiscussionsStore

  beforeEach(() => {
    store = new DiscussionsStore()
  })

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a post with all required fields', () => {
      const post = store.create({
        lesson: 'lesson-1',
        author: 'author-1',
        content: makeRichText('Hello world'),
      })
      expect(post.id).toBeDefined()
      expect(post.lesson).toBe('lesson-1')
      expect(post.author).toBe('author-1')
      expect(post.content.root.children[0].text).toBe('Hello world')
      expect(post.parentPost).toBeNull()
      expect(post.isPinned).toBe(false)
      expect(post.isResolved).toBe(false)
      expect(post.createdAt).toBeInstanceOf(Date)
      expect(post.updatedAt).toBeInstanceOf(Date)
    })

    it('should accept a parentPost id', () => {
      const parent = store.create({ lesson: 'l1', author: 'a1', content: makeRichText('Parent') })
      const reply = store.create({ lesson: 'l1', author: 'a1', content: makeRichText('Reply'), parentPost: parent.id })
      expect(reply.parentPost).toBe(parent.id)
    })
  })

  // ─── getAll ─────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('should return all posts sorted by createdAt desc', async () => {
      const p1 = store.create({ lesson: 'l1', author: 'a1', content: makeRichText('First') })
      await new Promise((r) => setTimeout(r, 10))
      const p2 = store.create({ lesson: 'l1', author: 'a1', content: makeRichText('Second') })

      const all = store.getAll()
      expect(all).toHaveLength(2)
      expect(all[0].id).toBe(p2.id)
      expect(all[1].id).toBe(p1.id)
    })

    it('should return empty array when no posts exist', () => {
      expect(store.getAll()).toEqual([])
    })
  })

  // ─── getById ────────────────────────────────────────────────────────────────

  describe('getById', () => {
    it('should return a post by id', () => {
      const created = store.create({ lesson: 'l1', author: 'a1', content: makeRichText('Test') })
      expect(store.getById(created.id)).toEqual(created)
    })

    it('should return null for non-existent id', () => {
      expect(store.getById('missing')).toBeNull()
    })
  })

  // ─── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update partial fields', () => {
      const post = store.create({ lesson: 'l1', author: 'a1', content: makeRichText('Old') })
      const updated = store.update(post.id, { content: makeRichText('New') })
      expect(updated.content.root.children[0].text).toBe('New')
      expect(updated.lesson).toBe('l1')
    })

    it('should set new updatedAt', async () => {
      const post = store.create({ lesson: 'l1', author: 'a1', content: makeRichText('Test') })
      await new Promise((r) => setTimeout(r, 10))
      const updated = store.update(post.id, { content: makeRichText('Updated') })
      expect(updated.updatedAt.getTime()).toBeGreaterThan(post.updatedAt.getTime())
    })

    it('should throw for non-existent id', () => {
      expect(() => store.update('missing', { content: makeRichText('X') })).toThrow(
        'Discussion post with id "missing" not found',
      )
    })
  })

  // ─── delete ─────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('should delete an existing post and return true', () => {
      const post = store.create({ lesson: 'l1', author: 'a1', content: makeRichText('Test') })
      expect(store.delete(post.id)).toBe(true)
      expect(store.getById(post.id)).toBeNull()
    })

    it('should return false for non-existent id', () => {
      expect(store.delete('missing')).toBe(false)
    })
  })

  // ─── getByLesson ────────────────────────────────────────────────────────────

  describe('getByLesson', () => {
    it('should return posts for the specified lesson', () => {
      store.create({ lesson: 'lesson-1', author: 'a1', content: makeRichText('A') })
      store.create({ lesson: 'lesson-2', author: 'a1', content: makeRichText('B') })
      store.create({ lesson: 'lesson-1', author: 'a1', content: makeRichText('C') })

      const results = store.getByLesson('lesson-1')
      expect(results).toHaveLength(2)
      expect(results.every((p) => p.lesson === 'lesson-1')).toBe(true)
    })

    it('should return empty array for a lesson with no posts', () => {
      expect(store.getByLesson('nonexistent')).toEqual([])
    })
  })

  // ─── getReplies ─────────────────────────────────────────────────────────────

  describe('getReplies', () => {
    it('should return direct replies to a post', () => {
      const parent = store.create({ lesson: 'l1', author: 'a1', content: makeRichText('Parent') })
      const r1 = store.create({ lesson: 'l1', author: 'a1', content: makeRichText('R1'), parentPost: parent.id })
      store.create({ lesson: 'l1', author: 'a1', content: makeRichText('R2'), parentPost: parent.id })
      store.create({ lesson: 'l1', author: 'a1', content: makeRichText('Other') })

      const replies = store.getReplies(parent.id)
      expect(replies).toHaveLength(2)
      expect(replies.map((r) => r.id)).toContain(r1.id)
    })
  })

  // ─── pin / unpin ────────────────────────────────────────────────────────────

  describe('pin', () => {
    it('should set isPinned to true', () => {
      const post = store.create({ lesson: 'l1', author: 'a1', content: makeRichText('Test') })
      expect(post.isPinned).toBe(false)
      const pinned = store.pin(post.id)
      expect(pinned.isPinned).toBe(true)
    })
  })

  describe('unpin', () => {
    it('should set isPinned to false', () => {
      const post = store.create({ lesson: 'l1', author: 'a1', content: makeRichText('Test') })
      store.pin(post.id)
      const unpinned = store.unpin(post.id)
      expect(unpinned.isPinned).toBe(false)
    })
  })

  // ─── resolve / unresolve ────────────────────────────────────────────────────

  describe('resolve', () => {
    it('should set isResolved to true', () => {
      const post = store.create({ lesson: 'l1', author: 'a1', content: makeRichText('Test') })
      expect(post.isResolved).toBe(false)
      const resolved = store.resolve(post.id)
      expect(resolved.isResolved).toBe(true)
    })
  })

  describe('unresolve', () => {
    it('should set isResolved to false', () => {
      const post = store.create({ lesson: 'l1', author: 'a1', content: makeRichText('Test') })
      store.resolve(post.id)
      const unresolved = store.unresolve(post.id)
      expect(unresolved.isResolved).toBe(false)
    })
  })
})
