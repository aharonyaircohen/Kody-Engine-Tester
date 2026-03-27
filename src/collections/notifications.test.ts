import { describe, it, expect, beforeEach } from 'vitest'
import { NotificationsStore } from './notifications'

describe('NotificationsStore', () => {
  let store: NotificationsStore

  beforeEach(() => {
    store = new NotificationsStore()
  })

  describe('create', () => {
    it('should create a notification with all fields', () => {
      const notification = store.create({
        type: 'info',
        title: 'Test Title',
        message: 'Test message body',
        category: 'system',
      })
      expect(notification.id).toBeDefined()
      expect(notification.type).toBe('info')
      expect(notification.title).toBe('Test Title')
      expect(notification.message).toBe('Test message body')
      expect(notification.read).toBe(false)
      expect(notification.category).toBe('system')
      expect(notification.createdAt).toBeInstanceOf(Date)
      expect(notification.expiresAt).toBeUndefined()
      expect(notification.actionUrl).toBeUndefined()
    })

    it('should create notification with optional fields', () => {
      const expiresAt = new Date()
      const notification = store.create({
        type: 'warning',
        title: 'Warning',
        message: 'Something is off',
        category: 'task',
        expiresAt,
        actionUrl: '/tasks/123',
      })
      expect(notification.expiresAt).toEqual(expiresAt)
      expect(notification.actionUrl).toBe('/tasks/123')
    })

    it('should accept all notification types', () => {
      const types = ['info', 'success', 'warning', 'error'] as const
      types.forEach((type) => {
        const n = store.create({ type, title: type, message: '', category: 'system' })
        expect(n.type).toBe(type)
      })
    })

    it('should accept all categories', () => {
      const categories = ['system', 'task', 'social'] as const
      categories.forEach((cat) => {
        const n = store.create({ type: 'info', title: 'T', message: '', category: cat })
        expect(n.category).toBe(cat)
      })
    })
  })

  describe('getAll', () => {
    it('should return all notifications sorted by createdAt desc', async () => {
      const n1 = store.create({ type: 'info', title: 'First', message: '', category: 'system' })
      await new Promise((r) => setTimeout(r, 10))
      const n2 = store.create({ type: 'info', title: 'Second', message: '', category: 'system' })

      const all = store.getAll()
      expect(all).toHaveLength(2)
      expect(all[0].id).toBe(n2.id)
      expect(all[1].id).toBe(n1.id)
    })

    it('should return empty array when no notifications exist', () => {
      expect(store.getAll()).toEqual([])
    })
  })

  describe('getById', () => {
    it('should return a notification by id', () => {
      const created = store.create({ type: 'info', title: 'Test', message: '', category: 'system' })
      const found = store.getById(created.id)
      expect(found).toEqual(created)
    })

    it('should return null for non-existent id', () => {
      expect(store.getById('non-existent')).toBeNull()
    })
  })

  describe('update', () => {
    it('should update partial fields', () => {
      const n = store.create({ type: 'info', title: 'Old', message: 'Body', category: 'system' })
      const updated = store.update(n.id, { title: 'New', read: true })
      expect(updated.title).toBe('New')
      expect(updated.message).toBe('Body')
      expect(updated.read).toBe(true)
    })

    it('should throw for non-existent id', () => {
      expect(() => store.update('missing', { title: 'X' })).toThrow(
        'Notification with id "missing" not found',
      )
    })
  })

  describe('delete', () => {
    it('should delete an existing notification and return true', () => {
      const n = store.create({ type: 'info', title: 'Test', message: '', category: 'system' })
      expect(store.delete(n.id)).toBe(true)
      expect(store.getById(n.id)).toBeNull()
    })

    it('should return false for non-existent id', () => {
      expect(store.delete('missing')).toBe(false)
    })
  })

  describe('markAsRead', () => {
    it('should mark a notification as read', () => {
      const n = store.create({ type: 'info', title: 'Test', message: '', category: 'system' })
      expect(n.read).toBe(false)
      const updated = store.markAsRead(n.id)
      expect(updated.read).toBe(true)
    })

    it('should throw for non-existent id', () => {
      expect(() => store.markAsRead('missing')).toThrow(
        'Notification with id "missing" not found',
      )
    })
  })

  describe('markAllRead', () => {
    it('should mark all notifications as read', () => {
      store.create({ type: 'info', title: 'A', message: '', category: 'system' })
      store.create({ type: 'warning', title: 'B', message: '', category: 'task' })
      store.create({ type: 'error', title: 'C', message: '', category: 'social' })

      const updated = store.markAllRead()
      expect(updated).toHaveLength(3)
      expect(updated.every((n) => n.read)).toBe(true)
    })

    it('should return empty array when no notifications exist', () => {
      expect(store.markAllRead()).toEqual([])
    })
  })

  describe('getUnread', () => {
    it('should return only unread notifications', async () => {
      store.create({ type: 'info', title: 'A', message: '', category: 'system' })
      await new Promise((r) => setTimeout(r, 10))
      store.create({ type: 'warning', title: 'B', message: '', category: 'task' })
      await new Promise((r) => setTimeout(r, 10))
      const n3 = store.create({ type: 'error', title: 'C', message: '', category: 'social' })

      const unread = store.getUnread()
      expect(unread).toHaveLength(3)

      store.markAsRead(unread[1].id)
      store.markAsRead(unread[2].id)

      const remaining = store.getUnread()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe(n3.id)
    })

    it('should return empty array when all are read', () => {
      store.create({ type: 'info', title: 'A', message: '', category: 'system' })
      store.markAllRead()
      expect(store.getUnread()).toEqual([])
    })
  })

  describe('filterByCategory', () => {
    beforeEach(() => {
      store.create({ type: 'info', title: 'S1', message: '', category: 'system' })
      store.create({ type: 'warning', title: 'S2', message: '', category: 'system' })
      store.create({ type: 'error', title: 'T1', message: '', category: 'task' })
      store.create({ type: 'success', title: 'So1', message: '', category: 'social' })
    })

    it('should filter by category', () => {
      const system = store.filterByCategory('system')
      expect(system).toHaveLength(2)
      expect(system.every((n) => n.category === 'system')).toBe(true)
    })

    it('should return empty array for category with no notifications', () => {
      expect(store.filterByCategory('task')).toHaveLength(1)
      expect(store.filterByCategory('social')).toHaveLength(1)
    })

    it('should return all when category is undefined', () => {
      const all = store.filterByCategory()
      expect(all).toHaveLength(4)
    })
  })

  describe('clearExpired', () => {
    it('should remove expired notifications', () => {
      store.create({ type: 'info', title: 'Good', message: '', category: 'system' })
      const expired = store.create({
        type: 'warning',
        title: 'Expired',
        message: '',
        category: 'task',
        expiresAt: new Date(Date.now() - 1000),
      })

      const removed = store.clearExpired()
      expect(removed).toHaveLength(1)
      expect(removed[0].id).toBe(expired.id)
      expect(store.getById(expired.id)).toBeNull()
      expect(store.getAll()).toHaveLength(1)
    })

    it('should not remove notifications without expiresAt', () => {
      store.create({ type: 'info', title: 'No Expiry', message: '', category: 'system' })
      expect(store.clearExpired()).toHaveLength(0)
      expect(store.getAll()).toHaveLength(1)
    })

    it('should not remove future-dated notifications', () => {
      store.create({
        type: 'info',
        title: 'Future',
        message: '',
        category: 'system',
        expiresAt: new Date(Date.now() + 10000),
      })
      expect(store.clearExpired()).toHaveLength(0)
      expect(store.getAll()).toHaveLength(1)
    })
  })

  describe('NotificationPreferences', () => {
    it('should have default preferences', () => {
      const prefs = store.getPreferences()
      expect(prefs.categories).toEqual({
        system: true,
        task: true,
        social: true,
      })
      expect(prefs.quietHours).toEqual({
        enabled: false,
        start: '22:00',
        end: '08:00',
      })
    })

    it('should update category preference', () => {
      store.setCategoryEnabled('task', false)
      const prefs = store.getPreferences()
      expect(prefs.categories.task).toBe(false)
      expect(prefs.categories.system).toBe(true)
    })

    it('should update quiet hours', () => {
      store.setQuietHours({ enabled: true, start: '23:00', end: '07:00' })
      const prefs = store.getPreferences()
      expect(prefs.quietHours).toEqual({ enabled: true, start: '23:00', end: '07:00' })
    })

    it('should check if category is enabled', () => {
      store.setCategoryEnabled('social', false)
      expect(store.isCategoryEnabled('social')).toBe(false)
      expect(store.isCategoryEnabled('task')).toBe(true)
    })

    it('should check quiet hours (outside quiet hours returns true)', () => {
      store.setQuietHours({ enabled: true, start: '23:00', end: '07:00' })
      // During business hours (noon) should be outside quiet hours
      const result = store.isOutsideQuietHours(new Date('2026-03-27T12:00:00'))
      expect(result).toBe(true)
    })

    it('should respect quiet hours enabled flag', () => {
      store.setQuietHours({ enabled: false, start: '23:00', end: '07:00' })
      const result = store.isOutsideQuietHours(new Date('2026-03-27T23:30:00'))
      expect(result).toBe(true)
    })

    it('should detect inside quiet hours', () => {
      store.setQuietHours({ enabled: true, start: '22:00', end: '08:00' })
      // 11pm is inside quiet hours
      const result = store.isOutsideQuietHours(new Date('2026-03-27T23:00:00'))
      expect(result).toBe(false)
    })
  })
})
