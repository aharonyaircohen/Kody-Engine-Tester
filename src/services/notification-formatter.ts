/**
 * Notification formatter service
 * @module services/notificationFormatter
 */

type NotificationType = 'enrollment' | 'grade' | 'reminder'

interface NotificationData {
  courseName?: string
  lessonName?: string
  grade?: string
  score?: string
  dueDate?: string
  message?: string
  [key: string]: string | undefined
}

/**
 * Formats a notification into subject and body strings based on type.
 * @example
 * const { subject, body } = formatNotification('enrollment', { courseName: 'CS101' })
 * // => { subject: ' enrollment', body: 'You have been enrolled in  enrollment. Happy learning!' }
 */
export function formatNotification(
  type: string,
  data: Record<string, string>,
): { subject: string; body: string } {
  switch (type) {
    case 'enrollment':
      return {
        subject: `${data.courseName || ''} enrollment`,
        body: `You have been enrolled in ${data.courseName || ''}. Happy learning!`,
      }

    case 'grade': {
      const grade = data.grade || ''
      const courseName = data.courseName || ''
      return {
        subject: ` grade posted for ${courseName}`,
        body: `Your grade of ${grade} has been posted for ${courseName}. Keep up the great work!`,
      }
    }

    case 'reminder': {
      const lessonName = data.lessonName || ''
      const dueDate = data.dueDate || ''
      return {
        subject: `Reminder: ${lessonName}`,
        body: `Reminder: ${lessonName} is due on ${dueDate}. ${data.message || ''}`.trim(),
      }
    }

    default:
      return {
        subject: 'Notification',
        body: data.message || 'You have a new notification.',
      }
  }
}