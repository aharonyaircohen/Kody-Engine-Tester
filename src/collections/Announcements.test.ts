import { describe, it, expect, beforeEach } from 'vitest'
import { AnnouncementsStore } from './Announcements'

describe('AnnouncementsStore', () => {
  let store: AnnouncementsStore

  beforeEach(() => {
    store = new AnnouncementsStore()
  })

  describe('create', () => {
    it('should create an announcement with all fields', () => {
      const announcement = store.create({
        title: 'Welcome to the Course',
        body: 'This is the course introduction.',
        course: 'course-123',
        priority: 'high',
        publishedAt: new Date('2026-04-01'),
      })
      expect(announcement.id).toBeDefined()
      expect(announcement.title).toBe('Welcome to the Course')
      expect(announcement.body).toBe('This is the course introduction.')
      expect(announcement.course).toBe('course-123')
      expect(announcement.priority).toBe('high')
      expect(announcement.publishedAt).toEqual(new Date('2026-04-01'))
      expect(announcement.createdAt).toBeInstanceOf(Date)
      expect(announcement.updatedAt).toBeInstanceOf(Date)
    })

    it('should default priority to low', () => {
      const announcement = store.create({
        title: 'Test Announcement',
        body: 'Body content',
        course: 'course-123',
      })
      expect(announcement.priority).toBe('low')
    })

    it('should default publishedAt to now', () => {
      const before = new Date()
      const announcement = store.create({
        title: 'Test',
        body: 'Body',
        course: 'course-123',
      })
      const after = new Date()
      expect(announcement.publishedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(announcement.publishedAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })

  describe('getAll', () => {
    it('should return all announcements sorted by publishedAt desc', async () => {
      store.create({
        title: 'First',
        body: 'A',
        course: 'course-1',
        publishedAt: new Date('2026-01-01'),
      })
      await new Promise((r) => setTimeout(r, 10))
      store.create({
        title: 'Second',
        body: 'B',
        course: 'course-1',
        publishedAt: new Date('2026-02-01'),
      })

      const all = store.getAll()
      expect(all).toHaveLength(2)
      expect(all[0].title).toBe('Second')
      expect(all[1].title).toBe('First')
    })

    it('should return empty array when no announcements exist', () => {
      expect(store.getAll()).toEqual([])
    })
  })

  describe('getById', () => {
    it('should return an announcement by id', () => {
      const created = store.create({
        title: 'Test',
        body: 'Body',
        course: 'course-123',
      })
      const found = store.getById(created.id)
      expect(found).toEqual(created)
    })

    it('should return null for non-existent id', () => {
      expect(store.getById('non-existent')).toBeNull()
    })
  })

  describe('update', () => {
    it('should update partial fields', () => {
      const announcement = store.create({
        title: 'Old Title',
        body: 'Old Body',
        course: 'course-123',
        priority: 'low',
      })
      const updated = store.update(announcement.id, { title: 'New Title', priority: 'high' })
      expect(updated.title).toBe('New Title')
      expect(updated.body).toBe('Old Body')
      expect(updated.priority).toBe('high')
    })

    it('should set new updatedAt', async () => {
      const announcement = store.create({
        title: 'Test',
        body: 'Body',
        course: 'course-123',
      })
      await new Promise((r) => setTimeout(r, 10))
      const updated = store.update(announcement.id, { body: 'Updated Body' })
      expect(updated.updatedAt.getTime()).toBeGreaterThan(announcement.updatedAt.getTime())
    })

    it('should throw for non-existent id', () => {
      expect(() => store.update('missing', { title: 'X' })).toThrow(
        'Announcement with id "missing" not found',
      )
    })
  })

  describe('delete', () => {
    it('should delete an existing announcement and return true', () => {
      const announcement = store.create({
        title: 'Test',
        body: 'Body',
        course: 'course-123',
      })
      expect(store.delete(announcement.id)).toBe(true)
      expect(store.getById(announcement.id)).toBeNull()
    })

    it('should return false for non-existent id', () => {
      expect(store.delete('missing')).toBe(false)
    })
  })

  describe('getByCourse', () => {
    beforeEach(() => {
      store.create({
        title: 'Course 1 Announcement',
        body: 'Body',
        course: 'course-1',
      })
      store.create({
        title: 'Course 2 Announcement',
        body: 'Body',
        course: 'course-2',
      })
      store.create({
        title: 'Another Course 1',
        body: 'Body',
        course: 'course-1',
      })
    })

    it('should return all announcements for a course', () => {
      const results = store.getByCourse('course-1')
      expect(results).toHaveLength(2)
      expect(results.every((a) => a.course === 'course-1')).toBe(true)
    })

    it('should return empty array for course with no announcements', () => {
      expect(store.getByCourse('course-999')).toEqual([])
    })
  })

  describe('getByPriority', () => {
    beforeEach(() => {
      store.create({ title: 'Low', body: 'Body', course: 'c1', priority: 'low' })
      store.create({ title: 'Medium', body: 'Body', course: 'c1', priority: 'medium' })
      store.create({ title: 'High', body: 'Body', course: 'c1', priority: 'high' })
      store.create({ title: 'Another Low', body: 'Body', course: 'c1', priority: 'low' })
    })

    it('should return announcements filtered by priority', () => {
      const low = store.getByPriority('low')
      expect(low).toHaveLength(2)
      expect(low.every((a) => a.priority === 'low')).toBe(true)

      const high = store.getByPriority('high')
      expect(high).toHaveLength(1)
      expect(high[0].title).toBe('High')
    })
  })

  describe('getPublished', () => {
    it('should return only published announcements', () => {
      store.create({
        title: 'Published',
        body: 'Body',
        course: 'c1',
        publishedAt: new Date('2026-01-01'),
      })
      store.create({
        title: 'Upcoming',
        body: 'Body',
        course: 'c1',
        publishedAt: new Date('2026-12-01'),
      })

      const published = store.getPublished()
      expect(published).toHaveLength(1)
      expect(published[0].title).toBe('Published')
    })
  })

  describe('getUpcoming', () => {
    it('should return only upcoming announcements', () => {
      store.create({
        title: 'Published',
        body: 'Body',
        course: 'c1',
        publishedAt: new Date('2026-01-01'),
      })
      store.create({
        title: 'Upcoming',
        body: 'Body',
        course: 'c1',
        publishedAt: new Date('2099-12-01'),
      })

      const upcoming = store.getUpcoming()
      expect(upcoming).toHaveLength(1)
      expect(upcoming[0].title).toBe('Upcoming')
    })
  })
})
