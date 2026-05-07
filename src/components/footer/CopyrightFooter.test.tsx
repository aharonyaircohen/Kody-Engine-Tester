import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CopyrightFooter } from './CopyrightFooter'

describe('CopyrightFooter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-01'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the copyright text with the frozen year', () => {
    render(<CopyrightFooter />)
    expect(screen.getByText(/© 2026 LearnHub/)).toBeDefined()
  })

  it('renders the year as a plain number', () => {
    render(<CopyrightFooter />)
    const copyrightText = screen.getByText(/© \d{4} LearnHub/)
    expect(copyrightText).toBeDefined()
  })
})
