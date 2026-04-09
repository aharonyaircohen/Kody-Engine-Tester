/**
 * Notification formatter service
 * Generates subject and body text for notification templates.
 * @module services/notification-formatter
 */

export interface NotificationTemplateData {
  courseName?: string
  studentName?: string
  assignmentName?: string
  grade?: string
  totalPoints?: string
  dueDate?: string
}

export interface FormattedNotification {
  subject: string
  body: string
}

const TEMPLATES = {
  enrollment: {
    subject: (data: NotificationTemplateData) =>
      `You've been enrolled in ${data.courseName ?? 'a course'}`,
    body: (data: NotificationTemplateData) =>
      `Dear ${data.studentName ?? 'Student'}, you have been successfully enrolled in ${data.courseName ?? 'the course'}. You can now access all course materials.`,
  },
  grade: {
    subject: (data: NotificationTemplateData) =>
      `Your grade for ${data.assignmentName ?? 'an assignment'}`,
    body: (data: NotificationTemplateData) =>
      `You received ${data.grade ?? '0'}/${data.totalPoints ?? '0'} on ${data.assignmentName ?? 'the assignment'} in ${data.courseName ?? 'the course'}.`,
  },
  reminder: {
    subject: (data: NotificationTemplateData) =>
      `Reminder: ${data.assignmentName ?? 'an assignment'} is due soon`,
    body: (data: NotificationTemplateData) =>
      `This is a reminder that ${data.assignmentName ?? 'the assignment'} in ${data.courseName ?? 'the course'} is due on ${data.dueDate ?? 'the specified date'}.`,
  },
} as const

/**
 * Formats a notification based on its type and provided data.
 *
 * @param type - The notification type ('enrollment', 'grade', 'reminder')
 * @param data - Key-value pairs for template interpolation
 * @returns Formatted notification with subject and body
 *
 * @example
 * const result = formatNotification('enrollment', { courseName: 'Math 101', studentName: 'Alice' })
 * // => { subject: "You've been enrolled in Math 101", body: "Dear Alice, you have been successfully enrolled in Math 101..." }
 */
export function formatNotification(
  type: string,
  data: Record<string, string>,
): FormattedNotification {
  const template = TEMPLATES[type as keyof typeof TEMPLATES]
  if (!template) {
    return {
      subject: 'Notification',
      body: `No template found for notification type: ${type}`,
    }
  }

  const templateData = data as NotificationTemplateData
  return {
    subject: template.subject(templateData),
    body: template.body(templateData),
  }
}
