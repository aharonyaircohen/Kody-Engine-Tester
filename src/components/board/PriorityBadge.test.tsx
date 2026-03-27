import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PriorityBadge } from './PriorityBadge'

describe('PriorityBadge', () => {
  it('should render "High" label for high priority', () => {
    render(<PriorityBadge priority="high" />)
    expect(screen.getByText('High')).toBeDefined()
  })

  it('should render "Medium" label for medium priority', () => {
    render(<PriorityBadge priority="medium" />)
    expect(screen.getByText('Medium')).toBeDefined()
  })

  it('should render "Low" label for low priority', () => {
    render(<PriorityBadge priority="low" />)
    expect(screen.getByText('Low')).toBeDefined()
  })

  it('should apply high CSS class for high priority', () => {
    const { container } = render(<PriorityBadge priority="high" />)
    expect(container.querySelector('.high')).toBeDefined()
  })

  it('should apply medium CSS class for medium priority', () => {
    const { container } = render(<PriorityBadge priority="medium" />)
    expect(container.querySelector('.medium')).toBeDefined()
  })

  it('should apply low CSS class for low priority', () => {
    const { container } = render(<PriorityBadge priority="low" />)
    expect(container.querySelector('.low')).toBeDefined()
  })
})
