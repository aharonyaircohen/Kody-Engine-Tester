/**
 * Notification formatter service
 * Generates subject and body for notification types: enrollment, grade, reminder
 * @module services/notificationFormatter
 */

export interface NotificationData {
  courseName?: string
  courseId?: string
  grade?: string
  assignmentName?: string
  dueDate?: string
  reminderText?: string
}

export interface FormattedNotification {
  subject: string
  body: string
}

const TEMPLATES = {
  enrollment: {
    subject: (data: NotificationData) => `You have been enrolled in ${data.courseName || 'a course'}`,
    body: (data: NotificationData) =>
      `Congratulations! You are now enrolled in ${data.courseName || 'the course'}.${data.courseId ? ` Course ID: ${data.courseId}` : ''}`,
  },
  grade: {
    subject: (data: NotificationData) =>
      `Your assignment "${data.assignmentName || 'assignment'}" has been graded`,
    body: (data: NotificationData) =>
      `Your assignment "${data.assignmentName || 'assignment'}" in ${data.courseName || 'your course'} has been graded.\n\nGrade: ${data.grade || 'N/A'}`,
  },
  reminder: {
    subject: (data: NotificationData) => `Reminder: ${data.reminderText || 'You have a pending task'}`,
    body: (data: NotificationData) =>
      `${data.reminderText || 'You have a pending task'}.${data.dueDate ? ` Due date: ${data.dueDate}` : ''}`,
  },
} as const

export type NotificationType = keyof typeof TEMPLATES

/**
 * Formats a notification into subject and body based on type
 * @example
 * const formatted = formatNotification('enrollment', { courseName: 'CS101', courseId: 'cs101-id' })
 * // => { subject: 'You have been enrolled in CS101', body: 'Congratulations! You are now enrolled in CS101. Course ID: cs101-id' }
 */
export function formatNotification(
  type: NotificationType,
  data: NotificationData,
): FormattedNotification {
  const template = TEMPLATES[type]
  if (!template) {
    throw new Error(`Unknown notification type: ${type}`)
  }
  return {
    subject: template.subject(data),
    body: template.body(data),
  }
}
