import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'
import { SearchService } from '@/services/searchService'
import { sanitizeHtml } from '@/security/sanitizers'

const VALID_COLLECTIONS = new Set(['courses', 'lessons', 'notes'])
const MAX_LIMIT = 100
const DEFAULT_LIMIT = 10

export const GET = withAuth(async (request: NextRequest, { user }) => {
  const { searchParams } = request.nextUrl

  const rawQuery = searchParams.get('q') ?? ''
  const rawCollections = searchParams.get('collections') ?? ''
  const rawPage = searchParams.get('page') ?? '1'
  const rawLimit = searchParams.get('limit') ?? String(DEFAULT_LIMIT)
  const rawStatus = searchParams.get('status') ?? ''
  const tagMode = searchParams.get('tagMode') === 'and' ? 'and' : ('or' as const)

  // Sanitize string inputs at the boundary
  const query = sanitizeHtml(rawQuery)
  const status = rawStatus ? sanitizeHtml(rawStatus) : undefined

  // Parse and validate collections
  const collections = rawCollections
    ? rawCollections
        .split(',')
        .map((c) => sanitizeHtml(c.trim()))
        .filter((c) => VALID_COLLECTIONS.has(c as typeof VALID_COLLECTIONS extends Set<infer T> ? T : never))
    : []

  // Parse and clamp pagination
  const page = Math.max(1, parseInt(rawPage, 10) || 1)
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(rawLimit, 10) || DEFAULT_LIMIT))

  // Admin and editor can see all content; viewers see only published
  const canSeeAll = user?.role === 'admin' || user?.role === 'editor'
  const effectiveStatus = canSeeAll ? status : (status ?? 'published')

  const payload = await getPayloadInstance()
  const searchService = new SearchService(payload)

  const result = await searchService.search(
    query,
    { collections, status: effectiveStatus, tagMode },
    { page, limit },
  )

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}, { optional: true })
