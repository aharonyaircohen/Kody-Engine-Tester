'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Pagination } from '@/components/contacts/Pagination'
import type { SearchResult } from '@/services/course-search'

const DEBOUNCE_MS = 300

interface CourseFinderProps {
  /** Base URL for the search API. Defaults to /api/courses/search */
  apiBase?: string
}

function CourseCard({ course }: { course: Record<string, unknown> }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
      <h3 style={{ margin: '0 0 8px' }}>{(course.title as string) ?? 'Untitled'}</h3>
      {course.shortDescription ? (
        <p style={{ margin: '0 0 8px', color: '#6b7280', fontSize: 14 }}>
          {course.shortDescription as string}
        </p>
      ) : null}
      <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#6b7280' }}>
        {course.difficulty ? (
          <span style={{ textTransform: 'capitalize' }}>{course.difficulty as string}</span>
        ) : null}
        {course.estimatedHours ? (
          <span>{(course.estimatedHours as number)}h</span>
        ) : null}
        {course.instructor ? (
          <span>
            {(course.instructor as { name?: string })?.name ?? String(course.instructor)}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function CourseFinder({ apiBase = '/api/courses/search' }: CourseFinderProps) {
  const [q, setQ] = useState('')
  const [instructor, setInstructor] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchCourses = useCallback(
    async (searchQ: string, searchInstructor: string, searchDifficulty: string, searchPage: number) => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (searchQ) params.set('q', searchQ)
        if (searchInstructor) params.set('instructor', searchInstructor)
        if (searchDifficulty) params.set('difficulty', searchDifficulty)
        if (searchPage > 1) params.set('page', String(searchPage))

        const res = await fetch(`${apiBase}?${params.toString()}`)
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
        }
        const data: SearchResult = await res.json()
        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load courses')
        setResult(null)
      } finally {
        setLoading(false)
      }
    },
    [apiBase],
  )

  // Single effect: debounces q/instructor changes, fires immediately for page/difficulty.
  // Separating the two cases prevents a stale-page request when setPage(1) is called
  // from a difficulty change — the first effect schedules a debounce-cancelled cleanup,
  // while the second fires the correct values immediately without a stale page.
  useEffect(() => {
    if (debounceTimer.current !== null) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      fetchCourses(q, instructor, difficulty, page)
    }, DEBOUNCE_MS)
    return () => {
      if (debounceTimer.current !== null) clearTimeout(debounceTimer.current)
    }
    // page and difficulty must be in deps so that any change (including setPage(1)
    // after a difficulty change) fires fetchCourses immediately via cleanup.
    // q and instructor are intentionally excluded so they debounce independently.
  }, [page, difficulty]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search courses…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 2, minWidth: 180, padding: '6px 10px' }}
          aria-label="Search courses"
        />
        <input
          type="text"
          placeholder="Instructor name…"
          value={instructor}
          onChange={(e) => setInstructor(e.target.value)}
          style={{ flex: 1, minWidth: 140, padding: '6px 10px' }}
          aria-label="Filter by instructor"
        />
        <select
          value={difficulty}
          onChange={(e) => { setDifficulty(e.target.value); setPage(1) }}
          style={{ flex: 1, minWidth: 120, padding: '6px 10px' }}
          aria-label="Filter by difficulty"
        >
          <option value="">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Results */}
      {loading && <p aria-live="polite">Loading…</p>}
      {error && (
        <p style={{ color: 'red' }} role="alert">
          {error}
        </p>
      )}
      {!loading && !error && result !== null && (
        <>
          {result.items.length === 0 ? (
            <p>No courses found.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {result.items.map((course) => (
                <CourseCard key={(course as Record<string, unknown>).id as string} course={course as Record<string, unknown>} />
              ))}
            </div>
          )}

          {result.totalPages > 1 && (
            <Pagination
              currentPage={result.page}
              totalPages={result.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </>
      )}
      {!loading && !error && result === null && (
        <p>Enter a search term or select a filter to find courses.</p>
      )}
    </div>
  )
}
