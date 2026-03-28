import { NextRequest } from 'next/server'
import { userStore, sessionStore, jwtService } from '@/auth'
import { createAuthMiddleware } from '@/middleware/auth-middleware'
import { getPayloadInstance } from '@/services/progress'
import { CourseSearchService } from '@/services/course-search'
import { sanitizeHtml } from '@/security/sanitizers'
import type { SortOption } from '@/services/course-search'

const auth = createAuthMiddleware(userStore, sessionStore, jwtService)

const VALID_SORT_OPTIONS = new Set<SortOption>(['relevance', 'newest', 'popularity', 'rating'])
const VALID_DIFFICULTIES = new Set(['beginner', 'intermediate', 'advanced'])
const MAX_LIMIT = 100
const DEFAULT_LIMIT = 10

export const GET = async (request: NextRequest) => {
  const authContext = await auth({
    authorization: request.headers.get('authorization') || undefined,
    ip: request.headers.get('x-forwarded-for') || undefined,
  })

  // Auth is optional for search — but rate limit errors still block
  if (authContext.status === 429) {
    return new Response(JSON.stringify({ error: authContext.error }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { searchParams } = request.nextUrl

  const rawQuery = searchParams.get('q') ?? ''
  const rawDifficulty = searchParams.get('difficulty') ?? ''
  const rawTags = searchParams.get('tags') ?? ''
  const rawSort = searchParams.get('sort') ?? 'relevance'
  const rawPage = searchParams.get('page') ?? '1'
  const rawLimit = searchParams.get('limit') ?? String(DEFAULT_LIMIT)
  const rawInstructor = searchParams.get('instructor') ?? ''
  const tagMode = searchParams.get('tagMode') === 'and' ? 'and' : ('or' as const)

  // Sanitize string inputs at the boundary
  const query = sanitizeHtml(rawQuery)
  const difficulty = rawDifficulty ? sanitizeHtml(rawDifficulty) : undefined
  const instructor = rawInstructor ? sanitizeHtml(rawInstructor) : undefined
  const tags = rawTags
    ? rawTags
        .split(',')
        .map((t) => sanitizeHtml(t.trim()))
        .filter(Boolean)
    : []

  // Validate difficulty
  if (difficulty && !VALID_DIFFICULTIES.has(difficulty)) {
    return new Response(
      JSON.stringify({ error: 'Invalid difficulty. Must be one of: beginner, intermediate, advanced' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // Validate and normalize sort
  const sort: SortOption = VALID_SORT_OPTIONS.has(rawSort as SortOption)
    ? (rawSort as SortOption)
    : 'relevance'

  // Parse and clamp pagination
  const page = Math.max(1, parseInt(rawPage, 10) || 1)
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(rawLimit, 10) || DEFAULT_LIMIT))

  // Students (and unauthenticated users) see only published courses
  const user = authContext.user
  const canSeeAll = user?.role === 'admin' || user?.role === 'instructor'
  const status = canSeeAll ? undefined : 'published'

  const payload = await getPayloadInstance()
  const searchService = new CourseSearchService(payload)

  const result = await searchService.searchCourses(
    query,
    { difficulty, tags, instructor, tagMode, ...(status ? { status } : {}) },
    sort,
    { page, limit },
  )

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
