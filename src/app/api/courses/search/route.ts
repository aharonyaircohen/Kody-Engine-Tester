import { NextRequest } from 'next/server'
import { getPayloadInstance } from '@/services/progress'
import { CourseSearchService } from '@/services/course-search'

const VALID_DIFFICULTIES = new Set(['beginner', 'intermediate', 'advanced'])

export const GET = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl

  const q = searchParams.get('q') ?? undefined
  const instructor = searchParams.get('instructor') ?? undefined
  const rawDifficulty = searchParams.get('difficulty') ?? undefined
  const rawPage = searchParams.get('page') ?? undefined
  const rawPageSize = searchParams.get('pageSize') ?? undefined

  // Validate difficulty
  if (rawDifficulty && !VALID_DIFFICULTIES.has(rawDifficulty)) {
    return new Response(
      JSON.stringify({ error: 'Invalid difficulty. Must be one of: beginner, intermediate, advanced' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const difficulty = rawDifficulty as 'beginner' | 'intermediate' | 'advanced' | undefined

  // Parse pagination
  const page = rawPage ? Math.max(1, parseInt(rawPage, 10) || 1) : undefined
  const pageSize = rawPageSize ? parseInt(rawPageSize, 10) || undefined : undefined

  const payload = await getPayloadInstance()
  const searchService = new CourseSearchService(payload)

  const result = await searchService.search({ q, instructor, difficulty, page, pageSize })

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
