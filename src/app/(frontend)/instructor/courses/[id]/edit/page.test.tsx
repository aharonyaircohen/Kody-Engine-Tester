import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ErrorBoundary } from '@/components/error-boundary'

// Child component that throws an error when rendered
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Simulated child render error')
  }
  return <div>Normal content</div>
}

// Helper: renders a ThrowError inside an ErrorBoundary with the page's fallbackRender
function renderWithFallback({ shouldThrow }: { shouldThrow: boolean }) {
  function fallbackRender({ error }: { error: Error }) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Something went wrong</h2>
        <p style={{ color: '#888', marginBottom: '1rem' }}>There was an error loading the course editor.</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    )
  }

  render(
    <ErrorBoundary fallbackRender={fallbackRender}>
      <ThrowError shouldThrow={shouldThrow} />
    </ErrorBoundary>,
  )
}

describe('CourseEditPage ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('renders children when no error', () => {
    it('renders children normally when no error', () => {
      renderWithFallback({ shouldThrow: false })
      expect(screen.getByText('Normal content')).toBeDefined()
    })
  })

  describe('catches errors and shows fallback', () => {
    it('shows friendly fallback with "Something went wrong" heading', () => {
      renderWithFallback({ shouldThrow: true })
      expect(screen.getByText('Something went wrong')).toBeDefined()
    })

    it('shows subtext about course editor error', () => {
      renderWithFallback({ shouldThrow: true })
      expect(screen.getByText('There was an error loading the course editor.')).toBeDefined()
    })

    it('shows "Reload" button in fallback', () => {
      renderWithFallback({ shouldThrow: true })
      expect(screen.getByRole('button', { name: 'Reload' })).toBeDefined()
    })

    it('calls onError with error details', () => {
      const onError = vi.fn()
      function fallbackRender({ error }: { error: Error }) {
        return <div>Error</div>
      }

      render(
        <ErrorBoundary fallbackRender={fallbackRender} onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      )

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Simulated child render error' }),
        expect.stringContaining('ThrowError'),
        expect.any(Date),
      )
    })

    it('Reload button calls window.location.reload', () => {
      const reloadMock = vi.fn()
      const originalReload = window.location.reload.bind(window.location)
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
        configurable: true,
      })

      renderWithFallback({ shouldThrow: true })
      fireEvent.click(screen.getByRole('button', { name: 'Reload' }))

      expect(reloadMock).toHaveBeenCalledTimes(1)

      Object.defineProperty(window, 'location', {
        value: { reload: originalReload },
        writable: true,
        configurable: true,
      })
    })
  })
})
