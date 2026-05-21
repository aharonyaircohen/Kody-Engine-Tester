import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { StatsCard } from './StatsCard'

describe('StatsCard', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it('renders loading state initially', () => {
    fetchSpy.mockImplementation(
      () =>
        new Promise(() => {}) as unknown as ReturnType<typeof fetch>
    )
    render(<StatsCard lessonIds={['lesson1']} />)
    expect(screen.getByText('Loading...')).toBeDefined()
  })

  it('renders all five stats after fetch resolves', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ mean: 2.5, median: 2, mode: null, stdDev: 1.5, count: 4 }),
    } as unknown as Response)

    render(<StatsCard lessonIds={['lesson1', 'lesson2']} />)

    await waitFor(() => {
      expect(screen.getByText('Mean')).toBeDefined()
    })
    expect(screen.getByText('Median')).toBeDefined()
    expect(screen.getByText('Mode')).toBeDefined()
    expect(screen.getByText('Std Dev')).toBeDefined()
    expect(screen.getByText('Count')).toBeDefined()
  })

  it('renders error state on fetch failure', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as unknown as Response)

    render(<StatsCard lessonIds={['lesson1']} />)

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeDefined()
    })
  })

  it('handles empty lessonIds without fetching', () => {
    fetchSpy.mockImplementation(
      () =>
        new Promise(() => {}) as unknown as ReturnType<typeof fetch>
    )
    render(<StatsCard lessonIds={[]} />)
    expect(screen.getByText('Count')).toBeDefined()
    expect(screen.queryByText('Loading...')).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('calls fetch with correct URL', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ mean: null, median: null, mode: null, stdDev: null, count: 2 }),
    } as unknown as Response)

    render(<StatsCard lessonIds={['id1', 'id2']} />)

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/stats?ids=id1%2Cid2')
    })
  })
})
