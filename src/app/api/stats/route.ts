import { NextRequest, NextResponse } from 'next/server'
import type { CollectionSlug } from 'payload'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'
import summarize from '@/utils/summarize'

/**
 * GET /api/stats?ids=lessonId1,lessonId2,...
 * Returns summary statistics over completion counts for the given lessons.
 * Each lesson's count = number of enrollments where completedLessons includes that lesson.
 */
export const GET = withAuth(
  async (request: NextRequest) => {
    const idsParam = request.nextUrl.searchParams.get('ids')
    if (!idsParam) {
      return NextResponse.json({ error: 'ids query param required' }, { status: 400 })
    }

    const lessonIds = idsParam
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)

    if (lessonIds.length === 0) {
      return NextResponse.json({ error: 'at least one lesson id required' }, { status: 400 })
    }

    const payload = await getPayloadInstance()

    const counts: number[] = []
    for (const lessonId of lessonIds) {
      const { totalDocs } = await payload.find({
        collection: 'enrollments' as CollectionSlug,
        where: {
          completedLessons: { in: [lessonId] },
        },
        limit: 0,
      })
      counts.push(totalDocs)
    }

    const stats = summarize(counts)
    return NextResponse.json(stats)
  },
  { optional: true }
)
