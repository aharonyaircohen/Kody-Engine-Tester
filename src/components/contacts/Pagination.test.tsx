import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('should render page numbers', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
    expect(screen.getByText('5')).toBeDefined()
  })

  it('should call onPageChange with correct page when page number clicked', () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByText('3'))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('should call onPageChange with prev page when prev button clicked', () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByText('‹'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('should call onPageChange with next page when next button clicked', () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByText('›'))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('should show disabled prev on page 1', () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />)
    const prevBtn = screen.getByText('‹').closest('button') as HTMLButtonElement
    expect(prevBtn.disabled).toBe(true)
  })

  it('should show disabled next on last page', () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={5} totalPages={5} onPageChange={onPageChange} />)
    const nextBtn = screen.getByText('›').closest('button') as HTMLButtonElement
    expect(nextBtn.disabled).toBe(true)
  })

  it('should render a single page without prev/next disabled issue', () => {
    const onPageChange = vi.fn()
    const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={onPageChange} />)
    expect(container.textContent).toContain('1')
  })
})
