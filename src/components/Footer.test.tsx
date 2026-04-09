import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('renders footer with default copyright', () => {
    render(<Footer />)
    expect(screen.getByTestId('footer')).toBeDefined()
    expect(screen.getByText('© 2026')).toBeDefined()
  })

  it('renders footer with custom copyright', () => {
    render(<Footer copyright="© 2025 Custom" />)
    expect(screen.getByText('© 2025 Custom')).toBeDefined()
  })
})