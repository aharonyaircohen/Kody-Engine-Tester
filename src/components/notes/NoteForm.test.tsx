import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NoteForm } from './NoteForm'

describe('NoteForm', () => {
  it('should render empty form fields', () => {
    render(<NoteForm onSubmit={vi.fn()} submitLabel="Create" />)
    expect(screen.getByLabelText('Title')).toHaveProperty('value', '')
    expect(screen.getByLabelText('Content')).toHaveProperty('value', '')
  })

  it('should pre-fill initial values', () => {
    render(
      <NoteForm
        initialValues={{ title: 'Hello', content: 'World', tags: ['a', 'b'] }}
        onSubmit={vi.fn()}
        submitLabel="Save"
      />,
    )
    expect(screen.getByLabelText('Title')).toHaveProperty('value', 'Hello')
    expect(screen.getByLabelText('Content')).toHaveProperty('value', 'World')
    expect(screen.getByLabelText('Tags (comma-separated)')).toHaveProperty('value', 'a, b')
  })

  it('should call onSubmit with parsed data', () => {
    const onSubmit = vi.fn()
    render(<NoteForm onSubmit={onSubmit} submitLabel="Create" />)

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My Note' } })
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Some content' } })
    fireEvent.change(screen.getByLabelText('Tags (comma-separated)'), {
      target: { value: 'tag1, tag2, tag3' },
    })
    fireEvent.submit(screen.getByRole('button', { name: 'Create' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'My Note',
      content: 'Some content',
      tags: ['tag1', 'tag2', 'tag3'],
    })
  })

  it('should filter empty tags', () => {
    const onSubmit = vi.fn()
    render(<NoteForm onSubmit={onSubmit} submitLabel="Create" />)

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Body' } })
    fireEvent.change(screen.getByLabelText('Tags (comma-separated)'), {
      target: { value: 'a,, ,b' },
    })
    fireEvent.submit(screen.getByRole('button', { name: 'Create' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Test',
      content: 'Body',
      tags: ['a', 'b'],
    })
  })
})
