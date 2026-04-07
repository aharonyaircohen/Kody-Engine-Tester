export interface NotificationTemplate {
  subject: string
  body: string
}

type NotificationType = 'enrollment' | 'grade' | 'reminder'

const templates: Record<NotificationType, (data: Record<string, string>) => NotificationTemplate> = {
  enrollment: (data) => ({
    subject: `You have been enrolled in ${data.courseName || 'a course'}`,
    body: `Dear ${data.studentName || 'Student'},\n\nYou have been successfully enrolled in ${data.courseName || 'the course'}. We look forward to seeing you in class!\n\nBest regards,\nThe Learning Team`,
  }),

  grade: (data) => ({
    subject: `Your grade for ${data.assignmentName || 'an assignment'} has been posted`,
    body: `Dear ${data.studentName || 'Student'},\n\nYour grade for ${data.assignmentName || 'the assignment'} in ${data.courseName || 'your course'} has been posted.\n\nGrade: ${data.grade || 'N/A'} / ${data.maxGrade || 'N/A'}\n\nBest regards,\nThe Learning Team`,
  }),

  reminder: (data) => ({
    subject: `Reminder: ${data.taskName || 'Task'} is due ${data.dueDate || 'soon'}`,
    body: `Dear ${data.studentName || 'Student'},\n\nThis is a friendly reminder that ${data.taskName || 'your task'} is due on ${data.dueDate || 'the specified date'}.\n\nPlease make sure to submit your work on time.\n\nBest regards,\nThe Learning Team`,
  }),
}

/**
 * Formats a notification based on its type and provided data.
 *
 * @example
 * const notification = formatNotification('enrollment', { courseName: 'Math 101', studentName: 'John' })
 * // => { subject: 'You have been enrolled in Math 101', body: 'Dear John,\n\nYou have been...' }
 */
export function formatNotification(type: string, data: Record<string, string>): NotificationTemplate {
  const formatter = templates[type as NotificationType]
  if (!formatter) {
    return {
      subject: `Notification: ${type}`,
      body: `You have received a notification of type: ${type}`,
    }
  }
  return formatter(data)
}