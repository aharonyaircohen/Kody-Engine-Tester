import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LessonEditor } from './LessonEditor'
import type { Lesson } from '@/collections/Lessons'

const makeLesson = (overrides: Partial<Lesson> = {}): Lesson => ({
  id: 'lesson-1',
  title: 'Intro Lesson',
  moduleId: 'mod-1',
  order: 0,
  type: 'text',
  content: 'Hello world',
  videoUrl: null,
  estimatedMinutes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LessonEditor', () => {
  describe('collapsed state', () => {
    it('should show lesson title and type tag', () => {
      render(<LessonEditor lesson={makeLesson()} onUpdate={vi.fn()} onDelete={vi.fn()} />)
      expect(screen.getByTestId('lesson-title').textContent).toBe('Intro Lesson')
      expect(screen.getByText('text')).toBeDefined()
    })

    it('should not show body when collapsed', () => {
      render(<LessonEditor lesson={makeLesson()} onUpdate={vi.fn()} onDelete={vi.fn()} />)
      expect(screen.queryByTestId('lesson-body')).toBeNull()
    })
  })

  describe('expanded state', () => {
    it('should show body when expand button clicked', () => {
      render(<LessonEditor lesson={makeLesson()} onUpdate={vi.fn()} onDelete={vi.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: 'expand lesson' }))
      expect(screen.getByTestId('lesson-body')).toBeDefined()
    })

    it('should show content textarea for text lessons', () => {
      render(<LessonEditor lesson={makeLesson({ type: 'text' })} onUpdate={vi.fn()} onDelete={vi.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: 'expand lesson' }))
      expect(screen.getByTestId('content-textarea')).toBeDefined()
    })

    it('should show video url input for video lessons', () => {
      render(
        <LessonEditor
          lesson={makeLesson({ type: 'video', videoUrl: 'https://youtube.com/watch?v=abc' })}
          onUpdate={vi.fn()}
          onDelete={vi.fn()}
        />,
      )
      fireEvent.click(screen.getByRole('button', { name: 'expand lesson' }))
      expect(screen.getByTestId('video-url-input')).toBeDefined()
    })

    it('should not show video url for text lessons', () => {
      render(<LessonEditor lesson={makeLesson({ type: 'text' })} onUpdate={vi.fn()} onDelete={vi.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: 'expand lesson' }))
      expect(screen.queryByTestId('video-url-input')).toBeNull()
    })
  })

  describe('type selector', () => {
    it('should call onUpdate with new type when type button clicked', () => {
      const onUpdate = vi.fn()
      render(<LessonEditor lesson={makeLesson({ type: 'text' })} onUpdate={onUpdate} onDelete={vi.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: 'expand lesson' }))
      fireEvent.click(screen.getByTestId('type-video'))
      expect(onUpdate).toHaveBeenCalledWith({ type: 'video' })
    })

    it('should call onUpdate with interactive type', () => {
      const onUpdate = vi.fn()
      render(<LessonEditor lesson={makeLesson({ type: 'text' })} onUpdate={onUpdate} onDelete={vi.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: 'expand lesson' }))
      fireEvent.click(screen.getByTestId('type-interactive'))
      expect(onUpdate).toHaveBeenCalledWith({ type: 'interactive' })
    })
  })

  describe('delete', () => {
    it('should call onDelete when delete button clicked', () => {
      const onDelete = vi.fn()
      render(<LessonEditor lesson={makeLesson()} onUpdate={vi.fn()} onDelete={onDelete} />)
      fireEvent.click(screen.getByTestId('delete-lesson'))
      expect(onDelete).toHaveBeenCalledOnce()
    })
  })

  describe('preview toggle', () => {
    it('should render toggle with initial aria-pressed false', () => {
      render(<LessonEditor lesson={makeLesson()} onUpdate={vi.fn()} onDelete={vi.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: 'expand lesson' }))
      const toggle = screen.getByTestId('preview-toggle')
      expect(toggle).toBeDefined()
      expect(toggle.getAttribute('aria-pressed')).toBe('false')
    })

    it('should flip aria-pressed to true on click', () => {
      render(<LessonEditor lesson={makeLesson()} onUpdate={vi.fn()} onDelete={vi.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: 'expand lesson' }))
      const toggle = screen.getByTestId('preview-toggle')
      fireEvent.click(toggle)
      expect(toggle.getAttribute('aria-pressed')).toBe('true')
    })

    it('should flip aria-pressed back to false on second click', () => {
      render(<LessonEditor lesson={makeLesson()} onUpdate={vi.fn()} onDelete={vi.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: 'expand lesson' }))
      const toggle = screen.getByTestId('preview-toggle')
      fireEvent.click(toggle)
      fireEvent.click(toggle)
      expect(toggle.getAttribute('aria-pressed')).toBe('false')
    })
  })
})
