import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CoursePublishToggle } from './CoursePublishToggle'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CoursePublishToggle', () => {
  describe('draft state', () => {
    it('should show Draft badge and Publish button when status is draft', () => {
      render(<CoursePublishToggle status="draft" onToggle={vi.fn()} />)
      expect(screen.getByText('Draft')).toBeDefined()
      expect(screen.getByTestId('publish-toggle-button').textContent).toBe('Publish')
    })

    it('should not show confirm dialog initially', () => {
      render(<CoursePublishToggle status="draft" onToggle={vi.fn()} />)
      expect(screen.queryByTestId('confirm-dialog')).toBeNull()
    })

    it('should show confirm dialog when Publish button clicked', () => {
      render(<CoursePublishToggle status="draft" onToggle={vi.fn()} />)
      fireEvent.click(screen.getByTestId('publish-toggle-button'))
      expect(screen.getByTestId('confirm-dialog')).toBeDefined()
    })
  })

  describe('published state', () => {
    it('should show Published badge and Unpublish button when status is published', () => {
      render(<CoursePublishToggle status="published" onToggle={vi.fn()} />)
      expect(screen.getByText('Published')).toBeDefined()
      expect(screen.getByTestId('publish-toggle-button').textContent).toBe('Unpublish')
    })

    it('should show confirm dialog when Unpublish button clicked', () => {
      render(<CoursePublishToggle status="published" onToggle={vi.fn()} />)
      fireEvent.click(screen.getByTestId('publish-toggle-button'))
      expect(screen.getByTestId('confirm-dialog')).toBeDefined()
    })
  })

  describe('confirmation dialog', () => {
    it('should call onToggle with "published" when confirming from draft', () => {
      const onToggle = vi.fn()
      render(<CoursePublishToggle status="draft" onToggle={onToggle} />)
      fireEvent.click(screen.getByTestId('publish-toggle-button'))
      fireEvent.click(screen.getByTestId('confirm-button'))
      expect(onToggle).toHaveBeenCalledWith('published')
    })

    it('should call onToggle with "draft" when confirming from published', () => {
      const onToggle = vi.fn()
      render(<CoursePublishToggle status="published" onToggle={onToggle} />)
      fireEvent.click(screen.getByTestId('publish-toggle-button'))
      fireEvent.click(screen.getByTestId('confirm-button'))
      expect(onToggle).toHaveBeenCalledWith('draft')
    })

    it('should hide dialog and not call onToggle when cancel clicked', () => {
      const onToggle = vi.fn()
      render(<CoursePublishToggle status="draft" onToggle={onToggle} />)
      fireEvent.click(screen.getByTestId('publish-toggle-button'))
      fireEvent.click(screen.getByTestId('cancel-button'))
      expect(onToggle).not.toHaveBeenCalled()
      expect(screen.queryByTestId('confirm-dialog')).toBeNull()
    })

    it('should hide dialog when overlay clicked', () => {
      render(<CoursePublishToggle status="draft" onToggle={vi.fn()} />)
      fireEvent.click(screen.getByTestId('publish-toggle-button'))
      fireEvent.click(screen.getByTestId('confirm-dialog'))
      expect(screen.queryByTestId('confirm-dialog')).toBeNull()
    })
  })
})
