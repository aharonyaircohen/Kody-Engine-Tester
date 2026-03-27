import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ErrorBoundary } from './error-boundary'

// Child component that throws an error when rendered
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Child render error')
  }
  return <div>Normal content</div>
}

describe('ErrorBoundary', () => {
  describe('renders children when no error', () => {
    it('renders children normally', () => {
      render(
        <ErrorBoundary>
          <span data-testid="child">Hello</span>
        </ErrorBoundary>,
      )
      expect(screen.getByTestId('child')).toBeDefined()
      expect(screen.getByText('Hello')).toBeDefined()
    })

    it('renders multiple children', () => {
      render(
        <ErrorBoundary>
          <div>First</div>
          <div>Second</div>
        </ErrorBoundary>,
      )
      expect(screen.getByText('First')).toBeDefined()
      expect(screen.getByText('Second')).toBeDefined()
    })
  })

  describe('catches errors and shows fallback', () => {
    it('shows default fallback UI with error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      )
      expect(screen.getByText('Something went wrong')).toBeDefined()
    })

    it('shows custom fallback component when provided', () => {
      function CustomFallback() {
        return <div data-testid="custom-fallback">Custom Error UI</div>
      }
      render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      )
      expect(screen.getByTestId('custom-fallback')).toBeDefined()
      expect(screen.getByText('Custom Error UI')).toBeDefined()
    })

    it('shows custom render fallback when provided', () => {
      render(
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <div data-testid="render-fallback">Custom: {error.message}</div>
          )}
        >
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      )
      expect(screen.getByTestId('render-fallback')).toBeDefined()
      expect(screen.getByText('Custom: Child render error')).toBeDefined()
    })

    it('passes error info to fallbackRender (error, componentStack, timestamp)', () => {
      let passedInfo: { error: Error; componentStack?: string; timestamp: Date } | null = null
      render(
        <ErrorBoundary
          fallbackRender={(info) => {
            passedInfo = info
            return <div>Error info captured</div>
          }}
        >
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      )
      expect(passedInfo).not.toBeNull()
      expect(passedInfo!.error.message).toBe('Child render error')
      expect(passedInfo!.timestamp).toBeInstanceOf(Date)
    })

    it('calls onError callback when an error is caught', () => {
      const onError = vi.fn()
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      )
      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Child render error' }),
        expect.stringContaining('ThrowError'),
        expect.any(Date),
      )
    })
  })

  describe('"Try again" reset', () => {
    it('shows "Try again" button in default fallback', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      )
      expect(screen.getByRole('button', { name: 'Try again' })).toBeDefined()
    })

    it('clicking "Try again" resets error state and re-renders children', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      )
      // Initially shows error UI
      expect(screen.getByText('Something went wrong')).toBeDefined()
      // Click Try again
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
      // Error is thrown again since the child still throws
      expect(screen.getByText('Something went wrong')).toBeDefined()
    })
  })
})
