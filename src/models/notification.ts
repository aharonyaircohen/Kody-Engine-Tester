/**
 * Notification domain model types
 * @module models/notification
 */

export type NotificationSeverity = 'info' | 'warning' | 'error'

export interface Notification {
  id: string
  recipient: string
  type: string
  severity: NotificationSeverity
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: Date
}

export interface NotificationFilter {
  severity?: NotificationSeverity
  isRead?: boolean
  recipientId?: string
}

// New notification model types (in-memory store pattern)
export type NotificationType = 'info' | 'warning' | 'error' | 'success'

export interface NotificationData {
  userId: string
  type: NotificationType
  title: string
  message: string
}

export interface NotificationRecord {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: Date
}

export interface NotificationServiceDeps {
  store?: NotificationStore
}

/**
 * In-memory notification store backed by an array.
 * Follows the repository/store pattern used in contacts.ts.
 */
export class NotificationStore {
  // Exposed for test reset
  notifications: NotificationRecord[] = []

  create(data: NotificationData): NotificationRecord {
    const record: NotificationRecord = {
      ...data,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date(),
    }
    this.notifications.push(record)
    return record
  }

  getByUserId(userId: string): NotificationRecord[] {
    return this.notifications.filter(n => n.userId === userId)
  }

  markRead(id: string): boolean {
    const n = this.notifications.find(n => n.id === id)
    if (!n) return false
    n.read = true
    return true
  }

  delete(id: string): boolean {
    const idx = this.notifications.findIndex(n => n.id === id)
    if (idx === -1) return false
    this.notifications.splice(idx, 1)
    return true
  }
}

export const notificationsStore = new NotificationStore()