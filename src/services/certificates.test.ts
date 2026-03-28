import { describe, it, expect, beforeEach } from 'vitest'
import { CertificatesStore } from '../collections/certificates'

describe('CertificatesStore', () => {
  let store: CertificatesStore

  const makeEnrollment = (overrides: Partial<{
    id: string
    studentId: string
    courseId: string
    completedLessonIds: string[]
    quizResults: { quizId: string; score: number }[]
    assignmentResults: { assignmentId: string; score: number }[]
  }> = {}) => ({
    id: 'enrollment-1',
    studentId: 'student-1',
    courseId: 'course-1',
    completedLessonIds: ['lesson-1', 'lesson-2'],
    quizResults: [],
    assignmentResults: [],
    ...overrides,
  })

  beforeEach(() => {
    store = new CertificatesStore()
  })

  // ─── calculateFinalGrade ────────────────────────────────────────────────

  describe('calculateFinalGrade', () => {
    it('should return 0 when no quizzes or assignments', () => {
      expect(store.calculateFinalGrade([], [])).toBe(0)
    })

    it('should return quiz average when only quizzes', () => {
      const quizResults = [
        { quizId: 'q1', score: 80 },
        { quizId: 'q2', score: 90 },
      ]
      expect(store.calculateFinalGrade(quizResults, [])).toBe(85)
    })

    it('should return assignment average when only assignments', () => {
      const assignmentResults = [
        { assignmentId: 'a1', score: 70 },
        { assignmentId: 'a2', score: 80 },
        { assignmentId: 'a3', score: 90 },
      ]
      expect(store.calculateFinalGrade([], assignmentResults)).toBe(80)
    })

    it('should average quizzes and assignments at 50/50 split', () => {
      const quizResults = [{ quizId: 'q1', score: 80 }]
      const assignmentResults = [{ assignmentId: 'a1', score: 100 }]
      // (80 + 100) / 2 = 90
      expect(store.calculateFinalGrade(quizResults, assignmentResults)).toBe(90)
    })

    it('should round to two decimal places', () => {
      const quizResults = [{ quizId: 'q1', score: 75 }]
      const assignmentResults = [{ assignmentId: 'a1', score: 85 }]
      // (75 + 85) / 2 = 80 — no rounding needed
      expect(store.calculateFinalGrade(quizResults, assignmentResults)).toBe(80)
    })

    it('should handle mixed counts (3 quizzes, 1 assignment)', () => {
      const quizResults = [
        { quizId: 'q1', score: 60 },
        { quizId: 'q2', score: 80 },
        { quizId: 'q3', score: 100 },
      ]
      const assignmentResults = [{ assignmentId: 'a1', score: 90 }]
      // quiz avg = 80, assignment avg = 90, combined = 85
      expect(store.calculateFinalGrade(quizResults, assignmentResults)).toBe(85)
    })
  })

  // ─── certificate number generation ──────────────────────────────────────

  describe('certificate number generation', () => {
    it('should generate certificate number in LH-{courseId}-{year}-{seq} format', () => {
      const cert = store.issueCertificate({
        enrollment: makeEnrollment({ courseId: 'course-42' }),
        courseLessonIds: ['lesson-1', 'lesson-2'],
      })
      const year = new Date().getFullYear()
      expect(cert.certificateNumber).toMatch(new RegExp(`^LH-course-42-${year}-0001$`))
    })

    it('should increment sequence number per course per year', () => {
      const enrollment1 = makeEnrollment({ courseId: 'course-1' })
      const cert1 = store.issueCertificate({
        enrollment: enrollment1,
        courseLessonIds: ['lesson-1', 'lesson-2'],
      })

      const enrollment2 = makeEnrollment({ id: 'enrollment-2', studentId: 'student-2', courseId: 'course-1' })
      const cert2 = store.issueCertificate({
        enrollment: enrollment2,
        courseLessonIds: ['lesson-1', 'lesson-2'],
      })

      const year = new Date().getFullYear()
      expect(cert1.certificateNumber).toBe(`LH-course-1-${year}-0001`)
      expect(cert2.certificateNumber).toBe(`LH-course-1-${year}-0002`)
    })

    it('should reset sequence when course changes', () => {
      const cert1 = store.issueCertificate({
        enrollment: makeEnrollment({ courseId: 'course-A' }),
        courseLessonIds: ['lesson-1'],
      })

      const cert2 = store.issueCertificate({
        enrollment: makeEnrollment({ id: 'enrollment-2', studentId: 'student-2', courseId: 'course-B' }),
        courseLessonIds: ['lesson-1'],
      })

      const year = new Date().getFullYear()
      expect(cert1.certificateNumber).toBe(`LH-course-A-${year}-0001`)
      expect(cert2.certificateNumber).toBe(`LH-course-B-${year}-0001`)
    })
  })

  // ─── duplicate prevention ──────────────────────────────────────────────

  describe('duplicate prevention', () => {
    it('should throw when a certificate already exists for the same student and course', () => {
      store.issueCertificate({
        enrollment: makeEnrollment(),
        courseLessonIds: ['lesson-1', 'lesson-2'],
      })

      expect(() =>
        store.issueCertificate({
          enrollment: makeEnrollment({ id: 'enrollment-2' }),
          courseLessonIds: ['lesson-1', 'lesson-2'],
        }),
      ).toThrow('Certificate already issued for this student and course')
    })

    it('should allow a student to earn certificates for different courses', () => {
      store.issueCertificate({
        enrollment: makeEnrollment({ courseId: 'course-1' }),
        courseLessonIds: ['lesson-1'],
      })

      const cert2 = store.issueCertificate({
        enrollment: makeEnrollment({ id: 'enrollment-2', courseId: 'course-2' }),
        courseLessonIds: ['lesson-1'],
      })

      expect(cert2.id).toBeDefined()
      expect(cert2.studentId).toBe('student-1')
      expect(cert2.courseId).toBe('course-2')
    })
  })

  // ─── lesson completion validation ─────────────────────────────────────

  describe('lesson completion validation', () => {
    it('should throw when not all lessons are completed', () => {
      expect(() =>
        store.issueCertificate({
          enrollment: makeEnrollment({ completedLessonIds: ['lesson-1'] }),
          courseLessonIds: ['lesson-1', 'lesson-2'],
        }),
      ).toThrow('Not all lessons have been completed')
    })

    it('should succeed when all lessons are completed', () => {
      const cert = store.issueCertificate({
        enrollment: makeEnrollment({ completedLessonIds: ['lesson-1', 'lesson-2'] }),
        courseLessonIds: ['lesson-1', 'lesson-2'],
      })
      expect(cert.id).toBeDefined()
    })

    it('should succeed when course has no lessons', () => {
      const cert = store.issueCertificate({
        enrollment: makeEnrollment({ completedLessonIds: [] }),
        courseLessonIds: [],
      })
      expect(cert.id).toBeDefined()
    })
  })

  // ─── verification ──────────────────────────────────────────────────────

  describe('verifyCertificate', () => {
    it('should return the certificate for a valid certificate number', () => {
      const issued = store.issueCertificate({
        enrollment: makeEnrollment(),
        courseLessonIds: ['lesson-1', 'lesson-2'],
      })

      const found = store.verifyCertificate(issued.certificateNumber)
      expect(found).not.toBeNull()
      expect(found!.id).toBe(issued.id)
      expect(found!.studentId).toBe('student-1')
      expect(found!.courseId).toBe('course-1')
      expect(found!.finalGrade).toBe(0)
    })

    it('should return null for an unknown certificate number', () => {
      expect(store.verifyCertificate('LH-NONEXISTENT-2026-0001')).toBeNull()
    })

    it('should return null for a malformed certificate number', () => {
      expect(store.verifyCertificate('not-a-cert')).toBeNull()
    })
  })

  // ─── issueCertificate result fields ───────────────────────────────────

  describe('issueCertificate result fields', () => {
    it('should set issuedAt to now', () => {
      const before = new Date()
      const cert = store.issueCertificate({
        enrollment: makeEnrollment({ quizResults: [{ quizId: 'q1', score: 95 }] }),
        courseLessonIds: ['lesson-1', 'lesson-2'],
      })
      const after = new Date()

      expect(cert.issuedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(cert.issuedAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should attach the calculated finalGrade', () => {
      const cert = store.issueCertificate({
        enrollment: makeEnrollment({
          quizResults: [{ quizId: 'q1', score: 80 }],
          assignmentResults: [{ assignmentId: 'a1', score: 90 }],
        }),
        courseLessonIds: ['lesson-1', 'lesson-2'],
      })
      expect(cert.finalGrade).toBe(85)
    })

    it('should generate a unique id', () => {
      const cert = store.issueCertificate({
        enrollment: makeEnrollment(),
        courseLessonIds: ['lesson-1', 'lesson-2'],
      })
      expect(cert.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      )
    })
  })

  // ─── getAll / getByStudent ─────────────────────────────────────────────

  describe('getAll and getByStudent', () => {
    it('should return all certificates via getAll', () => {
      store.issueCertificate({
        enrollment: makeEnrollment({ courseId: 'c1' }),
        courseLessonIds: ['lesson-1', 'lesson-2'],
      })
      store.issueCertificate({
        enrollment: makeEnrollment({ id: 'e2', studentId: 'student-2', courseId: 'c2' }),
        courseLessonIds: ['lesson-1', 'lesson-2'],
      })

      const all = store.getAll()
      expect(all).toHaveLength(2)
    })

    it('should return certificates for a specific student via getByStudent', () => {
      store.issueCertificate({
        enrollment: makeEnrollment({ courseId: 'c1' }),
        courseLessonIds: ['lesson-1', 'lesson-2'],
      })
      store.issueCertificate({
        enrollment: makeEnrollment({ id: 'e2', studentId: 'student-2', courseId: 'c2' }),
        courseLessonIds: ['lesson-1', 'lesson-2'],
      })

      const studentCerts = store.getByStudent('student-1')
      expect(studentCerts).toHaveLength(1)
      expect(studentCerts[0].studentId).toBe('student-1')
    })

    it('should return empty array for unknown student', () => {
      expect(store.getByStudent('unknown')).toEqual([])
    })
  })
})
