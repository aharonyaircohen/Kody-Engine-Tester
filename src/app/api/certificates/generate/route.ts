import { NextRequest } from 'next/server'
import type { CollectionSlug } from 'payload'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'
import { PayloadGradebookService } from '@/services/gradebook-payload'

function normalizeId(value: string | { id: string }): string {
  return typeof value === 'string' ? value : value.id
}

/**
 * Generates a deterministic certificate number for testing purposes.
 * Format: CERT-{courseIdShort}-{timestampBase36}
 */
export function generateCertificateNumber(courseId: string): string {
  const short = courseId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()
  const timestamp = Date.now().toString(36).toUpperCase()
  return `CERT-${short}-${timestamp}`
}

export const POST = withAuth(async (request: NextRequest, { user }) => {
  if (!user) {
    return Response.json({ success: false, error: 'Authentication required' }, { status: 401 })
  }

  let body: { studentId: string; courseId: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { studentId, courseId } = body

  if (!studentId || typeof studentId !== 'string') {
    return Response.json({ success: false, error: 'studentId is required' }, { status: 400 })
  }
  if (!courseId || typeof courseId !== 'string') {
    return Response.json({ success: false, error: 'courseId is required' }, { status: 400 })
  }

  const payload = await getPayloadInstance()

  // ── 1. Check enrollment ──────────────────────────────────────────────────
  const enrollmentResult = await payload.find({
    collection: 'enrollments' as CollectionSlug,
    where: {
      student: { equals: studentId },
      course: { equals: courseId },
    },
    limit: 1,
    depth: 0,
  })

  if (enrollmentResult.docs.length === 0) {
    return Response.json({ success: false, error: 'Not enrolled' }, { status: 403 })
  }

  const enrollment = enrollmentResult.docs[0] as unknown as {
    id: string
    completedLessons?: (string | { id: string })[]
  }

  // ── 2. Fetch all lessons in the course ───────────────────────────────────
  const { docs: lessons } = await payload.find({
    collection: 'lessons' as CollectionSlug,
    where: { course: { equals: courseId } },
    limit: 0,
    depth: 0,
  })

  const allLessonIds = lessons.map((l) => (l as unknown as { id: string }).id)
  const completedLessonIds = (enrollment.completedLessons ?? []).map(normalizeId)

  // ── 3. Check course completion ────────────────────────────────────────────
  const allCompleted = allLessonIds.every((lid) => completedLessonIds.includes(lid))
  if (!allCompleted) {
    return Response.json({ success: false, error: 'Course not complete' }, { status: 400 })
  }

  // ── 4. Check for existing certificate (idempotent) ───────────────────────
  const existingResult = await payload.find({
    collection: 'certificates' as CollectionSlug,
    where: {
      student: { equals: studentId },
      course: { equals: courseId },
    },
    limit: 1,
    depth: 0,
  })

  if (existingResult.docs.length > 0) {
    const existing = existingResult.docs[0]
    return Response.json({ success: true, data: existing }, { status: 200 })
  }

  // ── 5. Fetch final grade from gradebook (if available) ───────────────────
  let finalGrade: number | undefined
  try {
    const gradebookSvc = new PayloadGradebookService(payload)
    const studentGradebook = await gradebookSvc.getStudentGradebook(studentId)
    const courseEntry = studentGradebook.find((entry) => entry.courseId === courseId)
    if (courseEntry) {
      finalGrade = courseEntry.overallGrade
    }
  } catch {
    // gradebook lookup is best-effort; omit finalGrade if unavailable
  }

  // ── 6. Create the certificate ─────────────────────────────────────────────
  const certificateNumber = generateCertificateNumber(courseId)
  const certificateData: Record<string, unknown> = {
    student: studentId,
    course: courseId,
    issuedAt: new Date().toISOString(),
    certificateNumber,
  }
  if (finalGrade !== undefined) {
    certificateData.finalGrade = finalGrade
  }

  const certificate = await payload.create({
    collection: 'certificates' as CollectionSlug,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: certificateData as any,
  })

  return Response.json({ success: true, data: certificate }, { status: 201 })
})
