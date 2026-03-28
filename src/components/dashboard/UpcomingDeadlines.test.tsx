import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UpcomingDeadlines } from './UpcomingDeadlines'

describe('UpcomingDeadlines', () => {
  it('renders deadline items', () => {
    const deadlines = [
      { id: '1', title: 'Essay Draft', dueDate: '2026-04-01T00:00:00Z', type: 'assignment' as const },
      { id: '2', title: 'Chapter 3 Quiz', dueDate: '2026-04-05T00:00:00Z', type: 'quiz' as const },
    ]
    render(<UpcomingDeadlines deadlines={deadlines} />)
    expect(screen.getByText('Essay Draft')).toBeDefined()
    expect(screen.getByText('Chapter 3 Quiz')).toBeDefined()
  })

  it('renders empty state when no deadlines', () => {
    render(<UpcomingDeadlines deadlines={[]} />)
    expect(screen.getByText(/no upcoming deadlines/i)).toBeDefined()
  })
})
