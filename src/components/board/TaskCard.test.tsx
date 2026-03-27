import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskCard } from './TaskCard'
import type { Task } from '@/collections/tasks'

const mockTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: 'This is a test task',
  status: 'todo',
  priority: 'high',
  assignee: 'Alice Johnson',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  order: 0,
}

describe('TaskCard', () => {
  it('should render task title', () => {
    render(<TaskCard task={mockTask} onDragStart={vi.fn()} />)
    expect(screen.getByText('Test Task')).toBeDefined()
  })

  it('should render priority badge', () => {
    render(<TaskCard task={mockTask} onDragStart={vi.fn()} />)
    expect(screen.getByText('High')).toBeDefined()
  })

  it('should render assignee initials', () => {
    render(<TaskCard task={mockTask} onDragStart={vi.fn()} />)
    expect(screen.getByText('AJ')).toBeDefined()
  })

  it('should not render avatar when no assignee', () => {
    const unassignedTask = { ...mockTask, assignee: null }
    render(<TaskCard task={unassignedTask} onDragStart={vi.fn()} />)
    const avatars = document.querySelectorAll('[class*="avatar"]')
    expect(avatars).toHaveLength(0)
  })

  it('should call onDragStart with task id on drag', () => {
    const onDragStart = vi.fn()
    render(<TaskCard task={mockTask} onDragStart={onDragStart} />)
    const card = screen.getByRole('listitem')
    fireEvent.dragStart(card)
    expect(onDragStart).toHaveBeenCalledWith('task-1')
  })
})
