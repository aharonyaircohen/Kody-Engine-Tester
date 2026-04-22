import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RecommendationStrip } from './index'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const sampleItems = [
  {
    course: {
      id: 'course-1',
      title: 'Advanced TypeScript',
      instructor: { id: 1, firstName: 'Jane', lastName: 'Doe' },
    },
    score: 0.87,
    reasons: ['shared-tag:typescript', 'popular-among-cohort'],
  },
  {
    course: {
      id: 'course-2',
      title: 'React Performance',
      instructor: { id: 2, firstName: 'John', lastName: 'Smith' },
    },
    score: 0.65,
    reasons: ['popular-among-cohort'],
  },
  {
    course: {
      id: 'course-3',
      title: 'Node.js Patterns',
      instructor: { id: 3, firstName: 'Alex', lastName: 'Lee' },
    },
    score: 0.42,
    reasons: ['recently-published'],
  },
]

function mockFetchResponse(body: unknown, init: { status?: number } = {}) {
  return Promise.resolve({
    ok: (init.status ?? 200) >= 200 && (init.status ?? 200) < 300,
    status: init.status ?? 200,
    statusText: init.status === 401 ? 'Unauthorized' : 'OK',
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response)
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

describe('RecommendationStrip — loading state', () => {
  it('shows 3 skeleton cards while fetch is pending', async () => {
    // Keep fetch unsettled — component stays in loading state
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise(() => {}),
    )

    render(<RecommendationStrip userId="u1" />)
    await vi.advanceTimersByTimeAsync(300)

    const skeletons = document.querySelectorAll('.skeleton-card')
    expect(skeletons).toHaveLength(3)
  })
})

// ---------------------------------------------------------------------------
// Successful render
// ---------------------------------------------------------------------------

describe('RecommendationStrip — successful render', () => {
  it('renders N cards with title, instructor name, reason, and score bar', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockFetchResponse({
        items: sampleItems,
        userId: 'u1',
        generatedAt: new Date().toISOString(),
      }) as unknown as Response,
    )

    render(<RecommendationStrip userId="u1" />)

    // Advance past debounce + let the fetch + state update settle
    await vi.advanceTimersByTimeAsync(1000)
    await waitFor(() => {
      expect(screen.queryAllByRole('button')).toHaveLength(3)
    })

    // Titles
    expect(screen.getByText('Advanced TypeScript')).toBeDefined()
    expect(screen.getByText('React Performance')).toBeDefined()
    expect(screen.getByText('Node.js Patterns')).toBeDefined()

    // Instructors
    expect(screen.getByText('Jane Doe')).toBeDefined()
    expect(screen.getByText('John Smith')).toBeDefined()
    expect(screen.getByText('Alex Lee')).toBeDefined()

    // Score bar widths
    const bars = Array.from(document.querySelectorAll('.card-score-fill')) as HTMLElement[]
    expect(bars[0].style.width).toBe('87%')
    expect(bars[1].style.width).toBe('65%')
    expect(bars[2].style.width).toBe('42%')
  })

  it('cards are rendered as buttons with correct role and tabIndex', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockFetchResponse({
        items: sampleItems,
        userId: 'u1',
        generatedAt: new Date().toISOString(),
      }) as unknown as Response,
    )

    render(<RecommendationStrip userId="u1" />)
    await vi.advanceTimersByTimeAsync(1000)
    await waitFor(() => {
      expect(screen.queryAllByRole('button')).toHaveLength(3)
    })

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(3)
    buttons.forEach((btn) => {
      expect(btn.getAttribute('tabIndex')).toBe('0')
    })
  })
})

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

describe('RecommendationStrip — empty state', () => {
  it('shows empty state text when items array is empty', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockFetchResponse({
        items: [],
        userId: 'u1',
        generatedAt: new Date().toISOString(),
      }) as unknown as Response,
    )

    render(<RecommendationStrip userId="u1" />)
    await vi.advanceTimersByTimeAsync(1000)
    await waitFor(() => {
      expect(screen.queryByText(/No recommendations yet/)).toBeTruthy()
    })

    expect(
      screen.getByText('No recommendations yet — take a course to see suggestions.'),
    ).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

describe('RecommendationStrip — error state', () => {
  it('shows non-blocking error message on fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockFetchResponse({ error: 'Internal error' }, { status: 500 }) as unknown as Response,
    )

    render(<RecommendationStrip userId="u1" />)
    await vi.advanceTimersByTimeAsync(1000)
    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeTruthy()
    })

    expect(screen.getByRole('alert').textContent).toMatch(/Internal error/i)
  })

  it('shows error message on network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network failure'))

    render(<RecommendationStrip userId="u1" />)
    await vi.advanceTimersByTimeAsync(1000)
    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeTruthy()
    })

    expect(screen.getByRole('alert').textContent).toMatch(/Network failure|Failed to load/i)
  })
})

// ---------------------------------------------------------------------------
// onCourseClick
// ---------------------------------------------------------------------------

describe('RecommendationStrip — onCourseClick', () => {
  it('fires onCourseClick with (courseId, position) on card click', async () => {
    const onCourseClick = vi.fn()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockFetchResponse({
        items: sampleItems,
        userId: 'u1',
        generatedAt: new Date().toISOString(),
      }) as unknown as Response,
    )

    render(<RecommendationStrip userId="u1" onCourseClick={onCourseClick} />)
    await vi.advanceTimersByTimeAsync(1000)
    await waitFor(() => {
      expect(screen.queryAllByRole('button')).toHaveLength(3)
    })

    const buttons = screen.getAllByRole('button')

    // Click first card (position 0)
    fireEvent.click(buttons[0])
    expect(onCourseClick).toHaveBeenCalledTimes(1)
    expect(onCourseClick).toHaveBeenCalledWith('course-1', 0)

    // Click third card (position 2)
    fireEvent.click(buttons[2])
    expect(onCourseClick).toHaveBeenCalledTimes(2)
    expect(onCourseClick).toHaveBeenLastCalledWith('course-3', 2)
  })
})

// ---------------------------------------------------------------------------
// Keyboard accessibility
// ---------------------------------------------------------------------------

describe('RecommendationStrip — keyboard accessibility', () => {
  it('Enter key triggers onCourseClick on focused card', async () => {
    const onCourseClick = vi.fn()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockFetchResponse({
        items: sampleItems,
        userId: 'u1',
        generatedAt: new Date().toISOString(),
      }) as unknown as Response,
    )

    render(<RecommendationStrip userId="u1" onCourseClick={onCourseClick} />)
    await vi.advanceTimersByTimeAsync(1000)
    await waitFor(() => {
      expect(screen.queryAllByRole('button')).toHaveLength(3)
    })

    const buttons = screen.getAllByRole('button')

    // Focus second card and press Enter
    ;(buttons[1] as HTMLElement).focus()
    fireEvent.keyDown(buttons[1], { key: 'Enter' })

    expect(onCourseClick).toHaveBeenCalledTimes(1)
    expect(onCourseClick).toHaveBeenCalledWith('course-2', 1)
  })

  it('Space key triggers onCourseClick on focused card', async () => {
    const onCourseClick = vi.fn()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockFetchResponse({
        items: sampleItems,
        userId: 'u1',
        generatedAt: new Date().toISOString(),
      }) as unknown as Response,
    )

    render(<RecommendationStrip userId="u1" onCourseClick={onCourseClick} />)
    await vi.advanceTimersByTimeAsync(1000)
    await waitFor(() => {
      expect(screen.queryAllByRole('button')).toHaveLength(3)
    })

    const buttons = screen.getAllByRole('button')

    // Focus first card and press Space
    ;(buttons[0] as HTMLElement).focus()
    fireEvent.keyDown(buttons[0], { key: ' ' })

    expect(onCourseClick).toHaveBeenCalledTimes(1)
    expect(onCourseClick).toHaveBeenCalledWith('course-1', 0)
  })
})
