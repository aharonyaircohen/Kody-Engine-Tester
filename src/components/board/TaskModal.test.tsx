import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskModal } from './TaskModal'

describe('TaskModal', () => {
  it('should render "New Task" heading when no initialValues provided', () => {
    render(<TaskModal onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'New Task' })).toBeDefined()
  })

  it('should render "Edit Task" heading when initialValues is supplied', () => {
    render(
      <TaskModal
        initialValues={{ title: 'Existing Task' }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByRole('heading', { name: 'Edit Task' })).toBeDefined()
  })

  it('should pre-fill form fields from initialValues', () => {
    render(
      <TaskModal
        initialValues={{
          title: 'My Task',
          description: 'My description',
          priority: 'high',
          assignee: 'Alice',
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByLabelText('Title')).toHaveProperty('value', 'My Task')
    expect(screen.getByLabelText('Description')).toHaveProperty('value', 'My description')
    expect(screen.getByLabelText('Assignee')).toHaveProperty('value', 'Alice')
    expect(screen.getByLabelText('Priority')).toHaveProperty('value', 'high')
  })

  it('should call onSubmit with correct data when form is submitted', () => {
    const onSubmit = vi.fn()
    render(<TaskModal onSubmit={onSubmit} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Task' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test description' } })
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: 'low' } })
    fireEvent.change(screen.getByLabelText('Assignee'), { target: { value: 'Bob' } })

    fireEvent.submit(screen.getByRole('button', { name: 'Create Task' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Test Task',
      description: 'Test description',
      priority: 'low',
      assignee: 'Bob',
    })
  })

  it('should convert whitespace-only assignee to null', () => {
    const onSubmit = vi.fn()
    render(<TaskModal onSubmit={onSubmit} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Task' } })
    fireEvent.change(screen.getByLabelText('Assignee'), { target: { value: '   ' } })

    fireEvent.submit(screen.getByRole('button', { name: 'Create Task' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ assignee: null })
    )
  })

  it('should call onClose when overlay div is clicked', () => {
    const onClose = vi.fn()
    render(<TaskModal onSubmit={vi.fn()} onClose={onClose} />)

    // Click on the overlay (the outer div with role="dialog")
    fireEvent.click(screen.getByRole('dialog'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when close button (×) is clicked', () => {
    const onClose = vi.fn()
    render(<TaskModal onSubmit={vi.fn()} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should auto-focus the title input on mount', () => {
    render(<TaskModal onSubmit={vi.fn()} onClose={vi.fn()} />)
    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    expect(document.activeElement).toBe(titleInput)
  })

  it('should render all three priority options', () => {
    render(<TaskModal onSubmit={vi.fn()} onClose={vi.fn()} />)

    const prioritySelect = screen.getByLabelText('Priority') as HTMLSelectElement
    const options = prioritySelect.options
    const values = Array.from(options).map((o) => o.value)
    expect(values).toContain('low')
    expect(values).toContain('medium')
    expect(values).toContain('high')
  })

  it('should show "Create Task" submit button when no initialValues', () => {
    const onSubmit = vi.fn()
    render(<TaskModal onSubmit={onSubmit} onClose={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Create Task' })).toBeDefined()
  })

  it('should show "Save Changes" submit button when initialValues provided', () => {
    const onSubmit = vi.fn()
    render(
      <TaskModal
        initialValues={{ title: 'Existing' }}
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDefined()
  })

  it('should call onSubmit with updated values when editing an existing task', () => {
    const onSubmit = vi.fn()
    render(
      <TaskModal
        initialValues={{
          title: 'Original Task',
          description: 'Original description',
          priority: 'low',
          assignee: 'Charlie',
        }}
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />
    )

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated Task' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Save Changes' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Updated Task',
      description: 'Original description',
      priority: 'low',
      assignee: 'Charlie',
    })
  })
})
