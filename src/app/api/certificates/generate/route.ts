import { NextRequest } from 'next/server'
import type { CollectionSlug } from 'payload'
import { withAuth, type RouteContext } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'
import { PayloadGradebookService } from '@/services/gradebook-payload'

/** Normalizes a relationship ID to a plain string. */
function normalizeId(val: string | number | { id: string | number }): string {
  if (typeof val === 'string') return val
  if (typeof val === 'number') return String(val)
  return String(val.id)
}

/** Generates a deterministic certificate number: CERT-<courseId-short>-<timestamp-base36>. */
function generateCertificateNumber(courseId: string): string {
  const short = courseId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase()
  const ts = Date.now().toString(36).toUpperCase()
  return `CERT-${short}-${ts}`
}

/**
 * Core handler — exported separately for unit testing.
 * Tests should call this directly and pass a mock user via context.
 */
export async function handleGenerateCertificate(
  request: NextRequest,
  { user }: RouteContext,
): Promise<Response> {
    // Auth check
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Parse body
    let body: { studentId?: string; courseId?: string }
    try {
      body = await request.json()
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { studentId, courseId } = body

    if (!studentId || !courseId) {
      return new Response(
        JSON.stringify({ success: false, error: 'studentId and courseId are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    const payload = await getPayloadInstance()

    // ── 1. Find enrollment ──────────────────────────────────────────────────
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
      return new Response(JSON.stringify({ success: false, error: 'Not enrolled' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrollment = enrollmentResult.docs[0] as any

    // ── 2. Fetch all lessons for the course ────────────────────────────────
    const lessonsResult = await payload.find({
      collection: 'lessons' as CollectionSlug,
      where: { course: { equals: courseId } },
      limit: 0,
      depth: 0,
    })

    const courseLessonIds = lessonsResult.docs.map((doc) => normalizeId(doc.id as string | number | { id: string | number }))

    // ── 3. Check all lessons are completed ─────────────────────────────────
    // completedLessons may be string[] or { id: string }[]
    const rawCompleted = (enrollment.completedLessons ?? []) as (string | { id: string })[]
    const completedLessonIds = rawCompleted.map(normalizeId)

    const allComplete = courseLessonIds.every((lid) => completedLessonIds.includes(lid))

    if (!allComplete) {
      return new Response(JSON.stringify({ success: false, error: 'Course not complete' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // ── 4. Idempotency: return existing certificate if one exists ──────────
    const existingCerts = await payload.find({
      collection: 'certificates' as CollectionSlug,
      where: {
        student: { equals: studentId },
        course: { equals: courseId },
      },
      limit: 1,
      depth: 0,
    })

    if (existingCerts.docs.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existing = existingCerts.docs[0] as any
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: existing.id,
            student: existing.student,
            course: existing.course,
            issuedAt: existing.issuedAt,
            certificateNumber: existing.certificateNumber,
            finalGrade: existing.finalGrade,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // ── 5. Calculate finalGrade from gradebook ────────────────────────────
    let finalGrade: number = 0
    try {
      const gradebookSvc = new PayloadGradebookService(payload)
      const entries = await gradebookSvc.getStudentGradebook(studentId)
      const courseEntry = entries.find((e) => e.courseId === courseId)
      if (courseEntry && courseEntry.overallGrade !== undefined) {
        finalGrade = courseEntry.overallGrade
      }
    } catch {
      // Gradebook unavailable — leave as 0
    }

    // ── 6. Issue certificate ───────────────────────────────────────────────
    const certificateNumber = generateCertificateNumber(courseId)

    const created = await payload.create({
      collection: 'certificates' as CollectionSlug,
      data: {
        student: studentId,
        course: courseId,
        issuedAt: new Date().toISOString(),
        certificateNumber,
        finalGrade,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const certData = created as unknown as any

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: certData.id,
          student: certData.student,
          course: certData.course,
          issuedAt: certData.issuedAt,
          certificateNumber: certData.certificateNumber,
          finalGrade: certData.finalGrade,
        },
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      },
    )
}

/** Auth-guarded POST export for Next.js routing. */
export const POST = withAuth(handleGenerateCertificate, { roles: ['viewer', 'admin'] })
