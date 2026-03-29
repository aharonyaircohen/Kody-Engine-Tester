import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NotePreview } from './NotePreview'
import type { Note } from '@/collections/notes'

const mockNote: Note = {
  id: '42',
  title: 'Preview Note',
  content: 'Full content of the note here.',
  tags: ['react', 'testing'],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-03'),
}

describe('NotePreview', () => {
  it('shows a placeholder message when no note is selected', () => {
    render(<NotePreview note={null} />)
    expect(screen.getByText(/select a note/i)).toBeDefined()
  })

  it('renders the note title', () => {
    render(<NotePreview note={mockNote} />)
    expect(screen.getByText('Preview Note')).toBeDefined()
  })

  it('renders the full note content', () => {
    render(<NotePreview note={mockNote} />)
    expect(screen.getByText('Full content of the note here.')).toBeDefined()
  })

  it('renders tags as badges', () => {
    render(<NotePreview note={mockNote} />)
    expect(screen.getByText('react')).toBeDefined()
    expect(screen.getByText('testing')).toBeDefined()
  })

  it('renders an edit link pointing to the correct route', () => {
    render(<NotePreview note={mockNote} />)
    const link = screen.getByRole('link', { name: /edit/i })
    expect(link.getAttribute('href')).toBe('/notes/edit/42')
  })
})
