/**
 * Notification formatting and filtering utilities
 * @module utils/notificationHelpers
 */

import type { Notification, NotificationFilter, NotificationSeverity } from '@/models/notification'

/**
 * Formats a notification into a readable string representation
 * @example
 * const formatted = formatNotification({ severity: 'error', title: 'Error', message: 'Something went wrong' })
 * // => "[ERROR] Error: Something went wrong"
 */
export function formatNotification(notification: Notification): string {
  return `[${notification.severity.toUpperCase()}] ${notification.title}: ${notification.message}`
}

/**
 * Filters notifications based on provided criteria
 * @example
 * const filtered = filterNotifications(notifications, { severity: 'error', isRead: false })
 */
export function filterNotifications(
  notifications: Notification[],
  filter: NotificationFilter,
): Notification[] {
  return notifications.filter((n) => {
    if (filter.severity !== undefined && n.severity !== filter.severity) return false
    if (filter.isRead !== undefined && n.isRead !== filter.isRead) return false
    if (filter.recipientId !== undefined && n.recipient !== filter.recipientId) return false
    return true
  })
}

/**
 * Returns the count of unread notifications
 * @example
 * const count = getUnreadCount(notifications)
 */
export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter((n) => !n.isRead).length
}

/**
 * Sorts notifications by severity: error > warning > info
 * @example
 * const sorted = sortBySeverity(notifications)
 */
export function sortBySeverity(notifications: Notification[]): Notification[] {
  const order: Record<NotificationSeverity, number> = { error: 0, warning: 1, info: 2 }
  return [...notifications].sort((a, b) => order[a.severity] - order[b.severity])
}