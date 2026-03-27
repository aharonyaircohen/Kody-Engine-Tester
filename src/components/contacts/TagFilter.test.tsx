import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TagFilter } from './TagFilter'

describe('TagFilter', () => {
  const tags = ['engineering', 'design', 'product', 'marketing']

  it('should render all available tags', () => {
    render(<TagFilter availableTags={tags} selectedTags={[]} onChange={vi.fn()} />)
    tags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeDefined()
    })
  })

  it('should call onChange with tag added when clicked', () => {
    const onChange = vi.fn()
    render(<TagFilter availableTags={tags} selectedTags={[]} onChange={onChange} />)
    fireEvent.click(screen.getByText('engineering'))
    expect(onChange).toHaveBeenCalledWith(['engineering'])
  })

  it('should call onChange with tag removed when already selected', () => {
    const onChange = vi.fn()
    render(<TagFilter availableTags={tags} selectedTags={['engineering', 'design']} onChange={onChange} />)
    fireEvent.click(screen.getByText('engineering'))
    expect(onChange).toHaveBeenCalledWith(['design'])
  })

  it('should allow multiple tags to be selected', () => {
    const onChange = vi.fn()
    const { rerender } = render(<TagFilter availableTags={tags} selectedTags={[]} onChange={onChange} />)
    fireEvent.click(screen.getByText('engineering'))
    // Re-render with updated selectedTags to simulate parent state update
    rerender(<TagFilter availableTags={tags} selectedTags={['engineering']} onChange={onChange} />)
    fireEvent.click(screen.getByText('design'))
    // After second click, design should be added to existing engineering selection
    const lastCallArgs = onChange.mock.calls[onChange.mock.calls.length - 1][0] as string[]
    expect(lastCallArgs).toContain('engineering')
    expect(lastCallArgs).toContain('design')
  })

  it('should render no tags when availableTags is empty', () => {
    const { container } = render(<TagFilter availableTags={[]} selectedTags={[]} onChange={vi.fn()} />)
    expect(container.textContent).toBe('')
  })
})
