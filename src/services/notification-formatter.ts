export type NotificationTemplateType = 'enrollment' | 'grade' | 'reminder'

interface EnrollmentData {
  courseName: string
  instructorName?: string
}

interface GradeData {
  assignmentName: string
  grade: string
  courseName?: string
}

interface ReminderData {
  message: string
  dueDate?: string
}

type TemplateData = EnrollmentData | GradeData | ReminderData

function buildBody(type: NotificationTemplateType, data: TemplateData): string {
  switch (type) {
    case 'enrollment': {
      const d = data as EnrollmentData
      let body = `You have been enrolled in ${d.courseName}.`
      if (d.instructorName) {
        body += ` Your instructor is ${d.instructorName}.`
      }
      return body
    }
    case 'grade': {
      const d = data as GradeData
      let body = `Your grade for ${d.assignmentName} is ${d.grade}.`
      if (d.courseName) {
        body += ` Course: ${d.courseName}.`
      }
      return body
    }
    case 'reminder': {
      const d = data as ReminderData
      let body = d.message
      if (d.dueDate) {
        body += ` Due date: ${d.dueDate}.`
      }
      return body
    }
  }
}

export function formatNotification(
  type: NotificationTemplateType,
  data: TemplateData,
): { subject: string; body: string } {
  const subjects: Record<NotificationTemplateType, string> = {
    enrollment: 'You have been enrolled',
    grade: 'Your assignment has been graded',
    reminder: 'Reminder',
  }

  const subject = subjects[type]
  if (!subject) {
    throw new Error(`Unknown notification type: ${type}`)
  }

  return {
    subject,
    body: buildBody(type, data),
  }
}
