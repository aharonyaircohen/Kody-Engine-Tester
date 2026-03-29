import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NoteListItem } from './NoteListItem'
import type { Note } from '@/collections/notes'

const mockNote: Note = {
  id: '1',
  title: 'Test Note',
  content: 'First line of content\nSecond line of content',
  tags: ['alpha', 'beta'],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
}

describe('NoteListItem', () => {
  it('renders the note title', () => {
    render(<NoteListItem note={mockNote} selected={false} onClick={vi.fn()} />)
    expect(screen.getByText('Test Note')).toBeDefined()
  })

  it('renders the first line of content', () => {
    render(<NoteListItem note={mockNote} selected={false} onClick={vi.fn()} />)
    expect(screen.getByText('First line of content')).toBeDefined()
  })

  it('renders one colored dot per tag', () => {
    render(<NoteListItem note={mockNote} selected={false} onClick={vi.fn()} />)
    const dots = screen.getAllByRole('img', { hidden: true })
    // dots are aria-label'd with tag name
    expect(screen.getByLabelText('alpha')).toBeDefined()
    expect(screen.getByLabelText('beta')).toBeDefined()
  })

  it('calls onClick with note id when clicked', () => {
    const onClick = vi.fn()
    render(<NoteListItem note={mockNote} selected={false} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledWith('1')
  })

  it('applies selected styling when selected is true', () => {
    const { container } = render(<NoteListItem note={mockNote} selected={true} onClick={vi.fn()} />)
    const button = container.querySelector('[aria-pressed="true"]')
    expect(button).not.toBeNull()
  })
})
