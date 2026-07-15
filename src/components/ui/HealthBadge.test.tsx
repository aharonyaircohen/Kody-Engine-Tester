import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { HealthBadge } from './HealthBadge'

describe('HealthBadge', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders loading state initially', () => {
    render(<HealthBadge />)
    expect(screen.getByText('...')).toBeDefined()
  })

  it('renders OK when health endpoint returns 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    render(<HealthBadge />)

    await waitFor(() => {
      expect(screen.getByText('OK')).toBeDefined()
    })
  })

  it('renders DOWN when health endpoint returns non-200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    render(<HealthBadge />)

    await waitFor(() => {
      expect(screen.getByText('DOWN')).toBeDefined()
    })
  })

  it('renders DOWN when health endpoint throws', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'))

    render(<HealthBadge />)

    await waitFor(() => {
      expect(screen.getByText('DOWN')).toBeDefined()
    })
  })
})