import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NoteCard } from './NoteCard'
import type { Note } from '@/collections/notes'

const mockNote: Note = {
  id: '1',
  title: 'Test Note',
  content: 'This is the note content',
  tags: ['tag1', 'tag2'],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
}

describe('NoteCard', () => {
  it('should render title and content', () => {
    render(<NoteCard note={mockNote} onClick={vi.fn()} />)
    expect(screen.getByText('Test Note')).toBeDefined()
    expect(screen.getByText('This is the note content')).toBeDefined()
  })

  it('should render tags', () => {
    render(<NoteCard note={mockNote} onClick={vi.fn()} />)
    expect(screen.getByText('tag1')).toBeDefined()
    expect(screen.getByText('tag2')).toBeDefined()
  })

  it('should truncate long content', () => {
    const longNote = { ...mockNote, content: 'A'.repeat(150) }
    render(<NoteCard note={longNote} onClick={vi.fn()} />)
    expect(screen.getByText('A'.repeat(100) + '...')).toBeDefined()
  })

  it('should call onClick with note id', () => {
    const onClick = vi.fn()
    render(<NoteCard note={mockNote} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledWith('1')
  })
})
