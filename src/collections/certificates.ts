import type { CollectionConfig, CollectionSlug } from 'payload'

export const Certificates: CollectionConfig = {
  slug: 'certificates',
  fields: [
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'users' as CollectionSlug,
      required: true,
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses' as CollectionSlug,
      required: true,
    },
    {
      name: 'issuedAt',
      type: 'date',
      required: true,
    },
    {
      name: 'certificateNumber',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'finalGrade',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
    },
  ],
}

export interface Certificate {
  id: string
  studentId: string
  courseId: string
  issuedAt: Date
  certificateNumber: string
  finalGrade: number
}

export interface Enrollment {
  id: string
  studentId: string
  courseId: string
  completedLessonIds: string[]
  quizResults: QuizResult[]
  assignmentResults: AssignmentResult[]
}

export interface QuizResult {
  quizId: string
  score: number // 0–100
}

export interface AssignmentResult {
  assignmentId: string
  score: number // 0–100
}

export interface IssueCertificateInput {
  enrollment: Enrollment
  courseLessonIds: string[] // all lesson IDs for the course
}

export class CertificatesStore {
  private certificates: Map<string, Certificate> = new Map()
  private certificateNumbers: Map<string, string> = new Map() // certificateNumber → id

  private generateCertificateNumber(courseId: string): string {
    const year = new Date().getFullYear()
    const prefix = `LH-${courseId}-${year}-`
    let seq = 1
    for (const cert of this.certificates.values()) {
      if (cert.certificateNumber.startsWith(prefix)) {
        const existingSeq = parseInt(cert.certificateNumber.replace(prefix, ''), 10)
        if (!isNaN(existingSeq) && existingSeq >= seq) {
          seq = existingSeq + 1
        }
      }
    }
    return `${prefix}${String(seq).padStart(4, '0')}`
  }

  calculateFinalGrade(
    quizResults: QuizResult[],
    assignmentResults: AssignmentResult[],
  ): number {
    const quizAvg =
      quizResults.length > 0
        ? quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length
        : 0

    const assignmentAvg =
      assignmentResults.length > 0
        ? assignmentResults.reduce((sum, r) => sum + r.score, 0) / assignmentResults.length
        : 0

    const hasQuizzes = quizResults.length > 0
    const hasAssignments = assignmentResults.length > 0

    if (hasQuizzes && hasAssignments) {
      return Math.round(((quizAvg + assignmentAvg) / 2) * 100) / 100
    }
    if (hasQuizzes) return Math.round(quizAvg * 100) / 100
    if (hasAssignments) return Math.round(assignmentAvg * 100) / 100
    return 0
  }

  issueCertificate(input: IssueCertificateInput): Certificate {
    const { enrollment, courseLessonIds } = input

    // Validate all lessons completed
    const allLessonsCompleted = courseLessonIds.every((lid) =>
      enrollment.completedLessonIds.includes(lid),
    )
    if (!allLessonsCompleted) {
      throw new Error('Not all lessons have been completed')
    }

    // Prevent duplicate certificates
    for (const cert of this.certificates.values()) {
      if (cert.studentId === enrollment.studentId && cert.courseId === enrollment.courseId) {
        throw new Error('Certificate already issued for this student and course')
      }
    }

    const finalGrade = this.calculateFinalGrade(
      enrollment.quizResults,
      enrollment.assignmentResults,
    )

    const certificate: Certificate = {
      id: crypto.randomUUID(),
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      issuedAt: new Date(),
      certificateNumber: this.generateCertificateNumber(enrollment.courseId),
      finalGrade,
    }

    this.certificates.set(certificate.id, certificate)
    this.certificateNumbers.set(certificate.certificateNumber, certificate.id)
    return certificate
  }

  verifyCertificate(certificateNumber: string): Certificate | null {
    const id = this.certificateNumbers.get(certificateNumber)
    if (!id) return null
    return this.certificates.get(id) ?? null
  }

  getByStudent(studentId: string): Certificate[] {
    return Array.from(this.certificates.values()).filter(
      (c) => c.studentId === studentId,
    )
  }

  getById(id: string): Certificate | null {
    return this.certificates.get(id) ?? null
  }

  getAll(): Certificate[] {
    return Array.from(this.certificates.values())
  }
}

export const certificatesStore = new CertificatesStore()
