import { CreateNotificationInput, Notification } from '../collections/notifications'

// ─── Event types ───────────────────────────────────────────────────────────────

export type LmsEventType = 'enrollment' | 'grade-posted' | 'certificate-issued'

export interface EnrollmentPayload {
  studentId: string
  studentName: string
  courseId: string
  courseName: string
}

export interface GradePostedPayload {
  studentId: string
  studentName: string
  courseId: string
  courseName: string
  assignmentTitle: string
  grade: number
  maxScore: number
}

export interface CertificateIssuedPayload {
  studentId: string
  studentName: string
  courseId: string
  courseName: string
  certificateId: string
}

export type LmsEventPayload = EnrollmentPayload | GradePostedPayload | CertificateIssuedPayload

export type LmsEvent =
  | { type: 'enrollment'; payload: EnrollmentPayload }
  | { type: 'grade-posted'; payload: GradePostedPayload }
  | { type: 'certificate-issued'; payload: CertificateIssuedPayload }

// ─── Subscriber ───────────────────────────────────────────────────────────────

export type EventSubscriber = (event: LmsEvent) => void | Promise<void>

// ─── Dependency contract ───────────────────────────────────────────────────────

export interface NotificationServiceDeps {
  createNotification: (input: CreateNotificationInput) => Notification
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class NotificationService {
  private subscribers: EventSubscriber[] = []

  constructor(private deps: NotificationServiceDeps) {}

  subscribe(handler: EventSubscriber): () => void {
    this.subscribers.push(handler)
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== handler)
    }
  }

  async dispatch(event: LmsEvent): Promise<void> {
    await this.notifySubscribers(event)

    switch (event.type) {
      case 'enrollment':
        this.handleEnrollment(event.payload)
        break
      case 'grade-posted':
        this.handleGradePosted(event.payload)
        break
      case 'certificate-issued':
        this.handleCertificateIssued(event.payload)
        break
      default:
        // Unknown event types are silently ignored
        break
    }
  }

  private async notifySubscribers(event: LmsEvent): Promise<void> {
    for (const subscriber of this.subscribers) {
      await subscriber(event)
    }
  }

  private handleEnrollment(payload: EnrollmentPayload): void {
    this.deps.createNotification({
      type: 'success',
      title: 'Enrolled in course',
      message: `${payload.studentName}, you have been enrolled in "${payload.courseName}".`,
      category: 'system',
    })
  }

  private handleGradePosted(payload: GradePostedPayload): void {
    const percentage = Math.round((payload.grade / payload.maxScore) * 100)
    this.deps.createNotification({
      type: 'info',
      title: 'Grade posted',
      message: `${payload.studentName}, your grade for "${payload.assignmentTitle}" in "${payload.courseName}" is ${payload.grade}/${payload.maxScore} (${percentage}%).`,
      category: 'task',
    })
  }

  private handleCertificateIssued(payload: CertificateIssuedPayload): void {
    this.deps.createNotification({
      type: 'success',
      title: 'Certificate issued',
      message: `${payload.studentName}, your certificate for "${payload.courseName}" has been issued.`,
      category: 'system',
    })
  }
}
