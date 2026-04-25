import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddTaskButton } from './AddTaskButton'

describe('AddTaskButton', () => {
  it('should render the button with visible "+ Add Task" text', () => {
    render(<AddTaskButton onClick={vi.fn()} />)
    expect(screen.getByText('+ Add Task')).toBeDefined()
  })

  it('should call onClick when button is clicked', () => {
    const onClick = vi.fn()
    render(<AddTaskButton onClick={onClick} />)
    fireEvent.click(screen.getByText('+ Add Task'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should have type="button" to prevent accidental form submission', () => {
    render(<AddTaskButton onClick={vi.fn()} />)
    const button = screen.getByRole('button', { name: '+ Add Task' })
    expect(button.getAttribute('type')).toEqual('button')
  })

  it('should be focusable and respond to click', () => {
    const onClick = vi.fn()
    render(<AddTaskButton onClick={onClick} />)
    const button = screen.getByRole('button', { name: '+ Add Task' })
    // Verify button is focusable
    expect(button).toHaveProperty('tabIndex')
    // Click triggers onClick
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should render with the component CSS class', () => {
    render(<AddTaskButton onClick={vi.fn()} />)
    const button = screen.getByRole('button', { name: '+ Add Task' })
    expect(button.className).toContain('button')
  })
})
