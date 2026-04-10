export type NotificationType = 'enrollment' | 'grade' | 'reminder'

export interface NotificationData {
  courseName?: string
  courseId?: string
  grade?: string
  assignmentName?: string
  dueDate?: string
  userName?: string
}

export interface FormattedNotification {
  subject: string
  body: string
}

const templates: Record<NotificationType, { subject: string; body: string }> = {
  enrollment: {
    subject: 'Welcome to {{courseName}}!',
    body: 'Hi {{userName}}, you have successfully enrolled in {{courseName}}. Your learning journey begins now!',
  },
  grade: {
    subject: 'Your assignment "{{assignmentName}}" has been graded',
    body: 'Hi {{userName}}, you received a grade of {{grade}} on your assignment "{{assignmentName}}" in {{courseName}}.',
  },
  reminder: {
    subject: 'Reminder: "{{assignmentName}}" is due {{dueDate}}',
    body: 'Hi {{userName}}, this is a friendly reminder that "{{assignmentName}}" in {{courseName}} is due on {{dueDate}}. Don\'t forget to submit!',
  },
}

/**
 * Formats a notification by replacing template placeholders with provided data.
 *
 * @example
 * formatNotification('enrollment', { courseName: 'CS101', userName: 'John' })
 * // => { subject: 'Welcome to CS101!', body: 'Hi John, you have successfully enrolled in CS101...' }
 *
 * @example
 * formatNotification('grade', { courseName: 'CS101', grade: 'A', assignmentName: 'Quiz 1', userName: 'John' })
 * // => { subject: 'Your assignment "Quiz 1" has been graded', body: 'Hi John, you received a grade of A...' }
 */
export function formatNotification(
  type: string,
  data: Record<string, string>,
): FormattedNotification {
  const template = templates[type as NotificationType]

  if (!template) {
    return {
      subject: 'Notification',
      body: 'You have a new notification.',
    }
  }

  return {
    subject: interpolate(template.subject, data),
    body: interpolate(template.body, data),
  }
}

/**
 * Replaces {{placeholder}} patterns in a string with values from data.
 */
function interpolate(text: string, data: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? `{{${key}}}`)
}
