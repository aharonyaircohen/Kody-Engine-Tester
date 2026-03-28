import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecentActivity } from './RecentActivity'

describe('RecentActivity', () => {
  it('renders activity items', () => {
    const activities = [
      { id: '1', description: 'Completed lesson: Intro', timestamp: '2026-03-27T10:00:00Z' },
      { id: '2', description: 'Submitted: Essay Draft', timestamp: '2026-03-26T14:00:00Z' },
    ]
    render(<RecentActivity activities={activities} />)
    expect(screen.getByText('Completed lesson: Intro')).toBeDefined()
    expect(screen.getByText('Submitted: Essay Draft')).toBeDefined()
  })

  it('renders empty state when no activity', () => {
    render(<RecentActivity activities={[]} />)
    expect(screen.getByText(/no recent activity/i)).toBeDefined()
  })
})
