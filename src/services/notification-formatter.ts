/**
 * Notification formatter service
 * Generates localized subject and body text for notification types
 * @module services/notification-formatter
 */

export type NotificationFormatterType = 'enrollment' | 'grade' | 'reminder'

interface EnrollmentData {
  courseName: string
  instructorName: string
}

interface GradeData {
  courseName: string
  assignmentName: string
  grade: string
}

interface ReminderData {
  courseName: string
  dueDate: string
  assignmentName: string
}

export type FormatNotificationData = EnrollmentData | GradeData | ReminderData

const TEMPLATES = {
  enrollment: {
    subject: (data: EnrollmentData) => `Welcome to ${data.courseName}!`,
    body: (data: EnrollmentData) =>
      `You have been enrolled in ${data.courseName} by ${data.instructorName}. Start learning now!`,
  },
  grade: {
    subject: (data: GradeData) => `Your grade for ${data.assignmentName}`,
    body: (data: GradeData) =>
      `You received a grade of ${data.grade} in ${data.courseName} for ${data.assignmentName}.`,
  },
  reminder: {
    subject: (data: ReminderData) => `Reminder: ${data.assignmentName} due soon`,
    body: (data: ReminderData) =>
      `Don't forget! ${data.assignmentName} in ${data.courseName} is due on ${data.dueDate}.`,
  },
} as const

/**
 * Formats a notification into subject and body text based on type.
 * @param type - The notification type ('enrollment' | 'grade' | 'reminder')
 * @param data - Template data specific to the notification type
 * @returns An object with subject and body strings
 * @throws Error if the notification type is unknown
 */
export function formatNotification(
  type: string,
  data: Record<string, string>,
): { subject: string; body: string } {
  switch (type) {
    case 'enrollment': {
      const d = data as unknown as EnrollmentData
      return {
        subject: TEMPLATES.enrollment.subject(d),
        body: TEMPLATES.enrollment.body(d),
      }
    }
    case 'grade': {
      const d = data as unknown as GradeData
      return {
        subject: TEMPLATES.grade.subject(d),
        body: TEMPLATES.grade.body(d),
      }
    }
    case 'reminder': {
      const d = data as unknown as ReminderData
      return {
        subject: TEMPLATES.reminder.subject(d),
        body: TEMPLATES.reminder.body(d),
      }
    }
    default:
      throw new Error(`Unknown notification type: ${type}`)
  }
}