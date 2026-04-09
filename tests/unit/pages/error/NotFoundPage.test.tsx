import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import NotFoundPage from '@/pages/error/NotFoundPage'

describe('NotFoundPage', () => {
  it('renders "Page Not Found" heading', () => {
    render(<NotFoundPage />)
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeDefined()
  })

  it('renders a link back to home', () => {
    render(<NotFoundPage />)
    const link = screen.getByRole('link', { name: /go home/i })
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe('/')
  })

  it('renders a friendly message', () => {
    render(<NotFoundPage />)
    expect(screen.getByText(/sorry, the page you're looking for does not exist/i)).toBeDefined()
  })
})
