import type { NotificationType } from '@/collections/Notifications'

export interface Notification {
  id: string
  recipient: string
  type: NotificationType
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
}

export interface NotificationCounts {
  total: number
  unread: number
  byType: Record<NotificationType, number>
}

const TYPE_LABELS: Record<NotificationType, string> = {
  enrollment: 'Enrollment',
  grade: 'Grade',
  deadline: 'Deadline',
  discussion: 'Discussion',
  announcement: 'Announcement',
}

const TYPE_ICONS: Record<NotificationType, string> = {
  enrollment: '🎓',
  grade: '📝',
  deadline: '⏰',
  discussion: '💬',
  announcement: '📢',
}

/**
 * Returns a human-readable label for a notification type.
 */
export function getNotificationTypeLabel(type: NotificationType): string {
  return TYPE_LABELS[type] ?? type
}

/**
 * Returns an icon for a notification type.
 */
export function getNotificationIcon(type: NotificationType): string {
  return TYPE_ICONS[type] ?? '🔔'
}

/**
 * Formats a notification for display, combining icon and title.
 */
export function formatNotificationTitle(notification: Notification): string {
  const icon = getNotificationIcon(notification.type)
  return `${icon} ${notification.title}`
}

/**
 * Returns a preview of the notification message, truncated to maxLen.
 */
export function truncateMessage(message: string, maxLen: number = 100): string {
  if (!message) return ''
  if (message.length <= maxLen) return message
  return message.slice(0, maxLen - 3) + '...'
}

/**
 * Filters notifications by type.
 */
export function filterByType(
  notifications: Notification[],
  type: NotificationType
): Notification[] {
  return notifications.filter((n) => n.type === type)
}

/**
 * Filters notifications by multiple types.
 */
export function filterByTypes(
  notifications: Notification[],
  types: NotificationType[]
): Notification[] {
  const typeSet = new Set(types)
  return notifications.filter((n) => typeSet.has(n.type))
}

/**
 * Returns only unread notifications.
 */
export function getUnread(notifications: Notification[]): Notification[] {
  return notifications.filter((n) => !n.isRead)
}

/**
 * Returns only read notifications.
 */
export function getRead(notifications: Notification[]): Notification[] {
  return notifications.filter((n) => n.isRead)
}

/**
 * Sorts notifications by creation date, newest first.
 */
export function sortByDate(
  notifications: Notification[],
  descending: boolean = true
): Notification[] {
  return [...notifications].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return descending ? dateB - dateA : dateA - dateB
  })
}

/**
 * Groups notifications by type.
 */
export function groupByType(
  notifications: Notification[]
): Record<NotificationType, Notification[]> {
  const result: Record<NotificationType, Notification[]> = {
    enrollment: [],
    grade: [],
    deadline: [],
    discussion: [],
    announcement: [],
  }

  for (const notification of notifications) {
    result[notification.type].push(notification)
  }

  return result
}

/**
 * Calculates notification counts by type and total.
 */
export function getNotificationCounts(
  notifications: Notification[]
): NotificationCounts {
  const counts: NotificationCounts = {
    total: notifications.length,
    unread: 0,
    byType: {
      enrollment: 0,
      grade: 0,
      deadline: 0,
      discussion: 0,
      announcement: 0,
    },
  }

  for (const n of notifications) {
    if (!n.isRead) {
      counts.unread++
    }
    counts.byType[n.type]++
  }

  return counts
}

/**
 * Checks if a notification is past its relevance window.
 * Notifications older than days are considered stale.
 */
export function isStale(notification: Notification, days: number = 30): boolean {
  const createdAt = new Date(notification.createdAt)
  const now = new Date()
  const diffMs = now.getTime() - createdAt.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays > days
}

/**
 * Filters out stale notifications.
 */
export function filterStale(
  notifications: Notification[],
  days: number = 30
): Notification[] {
  return notifications.filter((n) => !isStale(n, days))
}
