import { describe, it, expect, beforeEach } from 'vitest'
import { notificationsStore } from './notification'

describe('notificationsStore', () => {
  beforeEach(() => {
    // reset store between tests
    notificationsStore.notifications.length = 0
  })

  it('creates a notification with generated id and defaults', () => {
    const n = notificationsStore.create({
      userId: 'user-1',
      type: 'info',
      title: 'Test',
      message: 'Hello',
    })
    expect(n.id).toBeTruthy()
    expect(n.read).toBe(false)
    expect(n.createdAt).toBeInstanceOf(Date)
    expect(n.userId).toBe('user-1')
    expect(n.title).toBe('Test')
  })

  it('getByUserId returns only matching notifications', () => {
    notificationsStore.create({ userId: 'user-1', type: 'info', title: 'T1', message: 'M1' })
    notificationsStore.create({ userId: 'user-2', type: 'warning', title: 'T2', message: 'M2' })
    const results = notificationsStore.getByUserId('user-1')
    expect(results).toHaveLength(1)
    expect(results[0].userId).toBe('user-1')
  })

  it('getByUserId returns empty array for user with no notifications', () => {
    const results = notificationsStore.getByUserId('ghost-user')
    expect(results).toHaveLength(0)
  })

  it('markRead returns true for existing notification', () => {
    const n = notificationsStore.create({ userId: 'user-1', type: 'info', title: 'T', message: 'M' })
    expect(notificationsStore.markRead(n.id)).toBe(true)
  })

  it('markRead returns false for unknown id', () => {
    expect(notificationsStore.markRead('nonexistent')).toBe(false)
  })

  it('markRead sets read to true on notification', () => {
    const n = notificationsStore.create({ userId: 'user-1', type: 'info', title: 'T', message: 'M' })
    notificationsStore.markRead(n.id)
    const stored = notificationsStore.getByUserId('user-1')[0]
    expect(stored.read).toBe(true)
  })

  it('delete returns true for existing notification', () => {
    const n = notificationsStore.create({ userId: 'user-1', type: 'info', title: 'T', message: 'M' })
    expect(notificationsStore.delete(n.id)).toBe(true)
    expect(notificationsStore.getByUserId('user-1')).toHaveLength(0)
  })

  it('delete returns false for unknown id', () => {
    expect(notificationsStore.delete('nonexistent')).toBe(false)
  })
})
