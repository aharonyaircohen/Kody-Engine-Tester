import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import ErrorPage from '@/pages/error/ErrorPage'

describe('ErrorPage', () => {
  const defaultProps = {
    error: new Error('Internal server error'),
    statusCode: 500,
  }

  it('renders generic error heading', () => {
    render(<ErrorPage {...defaultProps} />)
    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeDefined()
  })

  it('shows the status code', () => {
    render(<ErrorPage {...defaultProps} />)
    expect(screen.getByText('500')).toBeDefined()
  })

  it('shows error message in dev mode', () => {
    render(<ErrorPage {...defaultProps} />)
    expect(screen.getByText('Internal server error')).toBeDefined()
  })

  it('hides component stack in production mode', () => {
    const originalEnv = process.env.NODE_ENV
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(process.env as any).NODE_ENV = 'production'
    render(<ErrorPage {...defaultProps} />)
    expect(screen.queryByText(/at ErrorPage/)).toBeNull()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(process.env as any).NODE_ENV = originalEnv
  })

  it('shows component stack in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(process.env as any).NODE_ENV = 'development'
    const errorWithStack = new Error('Dev error')
    errorWithStack.stack = 'Error: Dev error\n    at SomeComponent (/app/components/SomeComponent.tsx:10:5)'
    render(<ErrorPage error={errorWithStack} statusCode={500} />)
    expect(screen.getByText(/SomeComponent/i)).toBeDefined()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(process.env as any).NODE_ENV = originalEnv
  })

  it('renders a link back to home', () => {
    render(<ErrorPage {...defaultProps} />)
    const link = screen.getByRole('link', { name: /go home/i })
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe('/')
  })
})
