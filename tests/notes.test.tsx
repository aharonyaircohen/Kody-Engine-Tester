import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NotesBadge } from '@/components/notes/NotesBadge'

describe('NotesBadge', () => {
  it('renders with count 0', () => {
    render(<NotesBadge count={0} />)

    const badge = screen.getByTestId('notes-badge')
    expect(badge).toBeTruthy()
    expect(badge.textContent).toBe('0')
  })

  it('renders with correct count', () => {
    render(<NotesBadge count={5} />)

    const badge = screen.getByTestId('notes-badge')
    expect(badge.textContent).toBe('5')
  })

  it('renders with large count', () => {
    render(<NotesBadge count={999} />)

    const badge = screen.getByTestId('notes-badge')
    expect(badge.textContent).toBe('999')
  })

  it('has the correct styling', () => {
    render(<NotesBadge count={3} />)

    const badge = screen.getByTestId('notes-badge')

    expect(badge.getAttribute('style')).toContain('background: rgb(51, 51, 51)')
    expect(badge.getAttribute('style')).toContain('color: rgb(170, 170, 170)')
    expect(badge.getAttribute('style')).toContain('padding: 2px 10px')
    expect(badge.getAttribute('style')).toContain('border-radius: 12px')
    expect(badge.getAttribute('style')).toContain('font-size: 0.8rem')
  })
})
