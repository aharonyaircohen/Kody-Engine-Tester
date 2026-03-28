import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AnalyticsCard } from './AnalyticsCard'

describe('AnalyticsCard', () => {
  it('renders label and value', () => {
    render(<AnalyticsCard label="Total Students" value={42} />)
    expect(screen.getByText('Total Students')).toBeDefined()
    expect(screen.getByText('42')).toBeDefined()
  })

  it('renders trend indicator when provided', () => {
    render(<AnalyticsCard label="Rate" value="75%" trend="up" />)
    expect(screen.getByLabelText('Trend: up')).toBeDefined()
  })

  it('does not render trend when not provided', () => {
    render(<AnalyticsCard label="Rate" value="75%" />)
    expect(screen.queryByLabelText(/Trend/)).toBeNull()
  })
})
