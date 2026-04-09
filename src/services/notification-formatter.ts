export interface NotificationData {
  studentName?: string
  courseName?: string
  assignmentName?: string
  grade?: string
  dueDate?: string
}

export function formatNotification(
  type: string,
  data: NotificationData,
): { subject: string; body: string } | null {
  switch (type) {
    case 'enrollment':
      return {
        subject: `You have been enrolled in ${data.courseName ?? 'a course'}`,
        body: `Dear ${data.studentName ?? 'Student'},\n\nYou have successfully enrolled in ${data.courseName ?? 'the requested course'}.\n\nWe look forward to seeing you in class!`,
      }

    case 'grade':
      return {
        subject: `Your assignment "${data.assignmentName ?? 'assignment'}" has been graded`,
        body: `Dear ${data.studentName ?? 'Student'},\n\nYour assignment "${data.assignmentName ?? ''}" has been graded.\n\nGrade: ${data.grade ?? 'N/A'}\n\nCheck your gradebook for full details.`,
      }

    case 'reminder':
      return {
        subject: `Reminder: "${data.assignmentName ?? 'assignment'}" is due soon`,
        body: `Dear ${data.studentName ?? 'Student'},\n\nThis is a reminder that "${data.assignmentName ?? 'an assignment'}" is due on ${data.dueDate ?? 'the specified date'}.\n\nPlease submit your work before the deadline.`,
      }

    default:
      return null
  }
}
