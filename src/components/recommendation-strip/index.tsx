'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Types — mirror the API response shape
// ---------------------------------------------------------------------------

export interface RecommendationStripProps {
  userId: string
  limit?: number
  onCourseClick?: (courseId: string, position: number) => void
  /** Optional auth token string to include as Bearer token.
   *  If omitted the fetch is sent with no Authorization header (relies on
   *  cookie-based auth or public access). */
  authToken?: string
}

interface ScoredCourseItem {
  course: {
    id: string
    title?: string
    instructor?: {
      id?: string | number
      firstName?: string
      lastName?: string
      displayName?: string
    }
  }
  score: number
  reasons: string[]
}

interface ApiResponse {
  items: ScoredCourseItem[]
  userId: string
  generatedAt: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function instructorName(
  inst: ScoredCourseItem['course']['instructor'],
): string {
  if (!inst) return ''
  if (typeof inst === 'string') return inst
  const first = inst.firstName ?? ''
  const last = inst.lastName ?? ''
  if (first || last) return `${first} ${last}`.trim()
  return (inst.displayName as string) ?? ''
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SKELETON_COUNT = 3
const DEBOUNCE_MS = 200

export function RecommendationStrip({
  userId,
  limit = 5,
  onCourseClick,
  authToken,
}: RecommendationStripProps) {
  const [items, setItems] = useState<ScoredCourseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debounce timer ref
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track pending userId to avoid stale fetch after unmount
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (debounceTimer.current !== null) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  const fetchRecommendations = useCallback(
    async (uid: string) => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ userId: uid })
        if (limit !== 5) params.set('limit', String(limit))

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`

        const res = await fetch(
          `/api/courses/recommendations?${params.toString()}`,
          { headers, credentials: 'include' },
        )

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          const msg = (body as { error?: string }).error ?? `Request failed (${res.status})`
          setError(msg)
          return
        }

        const data: ApiResponse = await res.json()
        if (mountedRef.current) {
          setItems(data.items ?? [])
          setError(null)
        }
      } catch (err) {
        if (mountedRef.current) {
          const msg =
            err instanceof Error ? err.message : 'Failed to load recommendations'
          setError(msg)
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    },
    [limit, authToken],
  )

  // Debounce on userId prop change
  useEffect(() => {
    if (debounceTimer.current !== null) {
      clearTimeout(debounceTimer.current)
    }
    debounceTimer.current = setTimeout(() => {
      if (userId) {
        fetchRecommendations(userId)
      }
    }, DEBOUNCE_MS)

    return () => {
      if (debounceTimer.current !== null) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [userId, fetchRecommendations])

  // Loading state: show 3 skeleton cards
  if (loading) {
    return (
      <div className="recommendation-strip" role="region" aria-label="Course recommendations">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <div key={i} className="skeleton-card" aria-hidden="true">
            <div className="skeleton-title" />
            <div className="skeleton-instructor" />
            <div className="skeleton-reason" />
            <div className="skeleton-bar-track">
              <div className="skeleton-bar-fill" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error state: non-blocking inline message
  if (error) {
    return (
      <div className="recommendation-strip" role="region" aria-label="Course recommendations">
        <p className="recommendation-error" role="alert">
          {error}
        </p>
      </div>
    )
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="recommendation-strip" role="region" aria-label="Course recommendations">
        <p className="recommendation-empty">
          No recommendations yet — take a course to see suggestions.
        </p>
      </div>
    )
  }

  // Recommendation cards
  return (
    <div className="recommendation-strip" role="region" aria-label="Course recommendations">
      {items.map((item, index) => {
        const course = item.course
        const scorePercent = Math.round(item.score * 100)
        const reasonString = item.reasons.slice(0, 2).join(', ').replace(/^shared-tag:/, '')

        function handleClick() {
          onCourseClick?.(course.id, index)
        }

        function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onCourseClick?.(course.id, index)
          }
        }

        return (
          <button
            key={course.id}
            className="recommendation-card"
            role="button"
            tabIndex={0}
            aria-label={`${course.title ?? 'Course'} — ${scorePercent}% match${reasonString ? `, ${reasonString}` : ''}`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
          >
            <span className="card-title">{course.title ?? 'Untitled course'}</span>
            <span className="card-instructor">
              {instructorName(course.instructor) || 'Unknown instructor'}
            </span>
            {reasonString && (
              <span className="card-reason">{reasonString}</span>
            )}
            <span className="card-score-track" aria-hidden="true">
              <span
                className="card-score-fill"
                style={{ width: `${scorePercent}%` }}
              />
            </span>
            <span className="card-score-label">{scorePercent}%</span>
          </button>
        )
      })}
    </div>
  )
}

export default RecommendationStrip
