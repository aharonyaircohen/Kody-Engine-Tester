import type { Payload, CollectionSlug } from 'payload'

export interface ProgressResult {
  completedLessons: number
  totalLessons: number
  percentage: number
}

interface EnrollmentDoc {
  completedLessons?: (string | { id: string })[]
  course: string | { id: string }
  status?: string
  [key: string]: unknown
}

/**
 * Normalizes a relationship ID to a string.
 * Payload relationship fields return { id: string } objects when populated,
 * or plain string IDs otherwise.
 */
function normalizeId(value: string | { id: string }): string {
  return typeof value === 'string' ? value : value.id
}

/**
 * Normalizes completedLessons to an array of string IDs.
 * Handles both string[] and { id: string }[] shapes from Payload.
 */
function normalizeLessonIds(raw: (string | { id: string })[] | undefined): string[] {
  return (raw ?? []).map(normalizeId)
}

/**
 * Returns the initialized Payload singleton. The singleton is already initialized
 * when Payload starts, so this returns that instance at runtime.
 */
export async function getPayloadInstance(): Promise<Payload> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { getPayload } = await import('payload')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return getPayload({} as any) as Promise<Payload>
}

export class ProgressService {
  constructor(private payload: Payload) {}

  /**
   * Records that a lesson has been completed for an enrollment.
   * Idempotent: re-calling with the same lesson has no additional effect.
   */
  async markLessonComplete(enrollmentId: string, lessonId: string): Promise<void> {
    const enrollment = (await this.payload.findByID({
      collection: 'enrollments' as CollectionSlug,
      id: enrollmentId,
    })) as unknown as EnrollmentDoc

    const completedLessons = normalizeLessonIds(enrollment.completedLessons)

    // Idempotency: skip if already recorded
    if (completedLessons.includes(lessonId)) {
      return
    }

    const updatedLessons = [...completedLessons, lessonId]

    await this.payload.update({
      collection: 'enrollments' as CollectionSlug,
      id: enrollmentId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { completedLessons: updatedLessons } as any,
    })

    await this.isComplete(enrollmentId)
  }

  /**
   * Returns progress statistics for an enrollment.
   */
  async getProgress(enrollmentId: string): Promise<ProgressResult> {
    const enrollment = (await this.payload.findByID({
      collection: 'enrollments' as CollectionSlug,
      id: enrollmentId,
    })) as unknown as EnrollmentDoc

    const courseId =
      typeof enrollment.course === 'string'
        ? enrollment.course
        : (enrollment.course as { id: string }).id

    const { totalDocs: totalLessons } = await this.payload.find({
      collection: 'lessons' as CollectionSlug,
      where: { course: { equals: courseId } },
      limit: 0,
    })

    const completedLessons = normalizeLessonIds(enrollment.completedLessons)
    const completedCount = completedLessons.length
    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

    return { completedLessons: completedCount, totalLessons, percentage }
  }

  /**
   * Returns true when all lessons in the course are marked complete.
   * If the enrollment is still active, transitions status to 'completed' and sets completedAt.
   */
  async isComplete(enrollmentId: string): Promise<boolean> {
    const enrollment = (await this.payload.findByID({
      collection: 'enrollments' as CollectionSlug,
      id: enrollmentId,
    })) as unknown as EnrollmentDoc

    const courseId =
      typeof enrollment.course === 'string'
        ? enrollment.course
        : (enrollment.course as { id: string }).id

    const { totalDocs: totalLessons } = await this.payload.find({
      collection: 'lessons' as CollectionSlug,
      where: { course: { equals: courseId } },
      limit: 0,
    })

    const completedLessons = normalizeLessonIds(enrollment.completedLessons)
    const complete = totalLessons > 0 && completedLessons.length >= totalLessons

    if (complete && enrollment.status === 'active') {
      await this.payload.update({
        collection: 'enrollments' as CollectionSlug,
        id: enrollmentId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: {
          status: 'completed',
          completedAt: new Date().toISOString(),
        } as any,
      })
    }

    return complete
  }
}
