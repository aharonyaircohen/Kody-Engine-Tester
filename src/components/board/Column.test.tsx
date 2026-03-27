import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Column } from './Column'
import type { Task } from '@/collections/tasks'

const mockTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Body',
  status: 'todo',
  priority: 'high',
  assignee: 'Alice',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  order: 0,
}

describe('Column', () => {
  it('should render column title', () => {
    render(<Column title="Todo" tasks={[]} onDrop={vi.fn()} onDragStart={vi.fn()} />)
    expect(screen.getByText('Todo')).toBeDefined()
  })

  it('should render task count', () => {
    render(<Column title="Todo" tasks={[mockTask]} onDrop={vi.fn()} onDragStart={vi.fn()} />)
    expect(screen.getByText('1')).toBeDefined()
  })

  it('should render task cards', () => {
    render(<Column title="Todo" tasks={[mockTask]} onDrop={vi.fn()} onDragStart={vi.fn()} />)
    expect(screen.getByText('Test Task')).toBeDefined()
  })

  it('should render multiple task cards', () => {
    const tasks: Task[] = [
      { ...mockTask, id: 't1', title: 'Task 1' },
      { ...mockTask, id: 't2', title: 'Task 2' },
    ]
    render(<Column title="In Progress" tasks={tasks} onDrop={vi.fn()} onDragStart={vi.fn()} />)
    expect(screen.getByText('Task 1')).toBeDefined()
    expect(screen.getByText('Task 2')).toBeDefined()
  })

  it('should call onDrop when a task is dropped', () => {
    const onDrop = vi.fn()
    render(<Column title="Done" tasks={[]} onDrop={onDrop} onDragStart={vi.fn()} />)
    const column = screen.getByTestId('board-column')
    fireEvent.drop(column, { dataTransfer: { getData: () => 'task-1' } })
    expect(onDrop).toHaveBeenCalledWith('task-1')
  })

  it('should not call onDrop when no taskId is present', () => {
    const onDrop = vi.fn()
    render(<Column title="Done" tasks={[]} onDrop={onDrop} onDragStart={vi.fn()} />)
    const column = screen.getByTestId('board-column')
    fireEvent.drop(column, { dataTransfer: { getData: () => '' } })
    expect(onDrop).not.toHaveBeenCalled()
  })
})
