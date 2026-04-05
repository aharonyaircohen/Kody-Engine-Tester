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