import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ModuleList } from './ModuleList'
import type { Module } from '@/collections/Modules'
import type { Lesson } from '@/collections/Lessons'

const makeModule = (overrides: Partial<Module> = {}): Module => ({
  id: 'mod-1',
  title: 'Module One',
  courseId: 'course-1',
  order: 0,
  description: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const makeLesson = (overrides: Partial<Lesson> = {}): Lesson => ({
  id: 'lesson-1',
  title: 'Lesson One',
  moduleId: 'mod-1',
  order: 0,
  type: 'text',
  content: '',
  videoUrl: null,
  estimatedMinutes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const defaultProps = {
  modules: [],
  lessons: {},
  onReorder: vi.fn(),
  onAddModule: vi.fn(),
  onUpdateModule: vi.fn(),
  onDeleteModule: vi.fn(),
  onAddLesson: vi.fn(),
  onUpdateLesson: vi.fn(),
  onDeleteLesson: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ModuleList', () => {
  describe('rendering', () => {
    it('should render empty state with add module button', () => {
      render(<ModuleList {...defaultProps} />)
      expect(screen.getByTestId('add-module')).toBeDefined()
    })

    it('should render a module with its title', () => {
      const mod = makeModule({ title: 'Intro to React' })
      render(<ModuleList {...defaultProps} modules={[mod]} />)
      expect(screen.getByText('Intro to React')).toBeDefined()
    })

    it('should render multiple modules', () => {
      const modules = [
        makeModule({ id: 'm1', title: 'Module A', order: 0 }),
        makeModule({ id: 'm2', title: 'Module B', order: 1 }),
      ]
      render(<ModuleList {...defaultProps} modules={modules} />)
      expect(screen.getByText('Module A')).toBeDefined()
      expect(screen.getByText('Module B')).toBeDefined()
    })

    it('should render lessons inside their module', () => {
      const mod = makeModule()
      const lesson = makeLesson({ title: 'Hello World Lesson' })
      render(
        <ModuleList
          {...defaultProps}
          modules={[mod]}
          lessons={{ 'mod-1': [lesson] }}
        />,
      )
      expect(screen.getByText('Hello World Lesson')).toBeDefined()
    })
  })

  describe('module reordering', () => {
    it('should call onReorder with correct args when dropping a module', () => {
      const modules = [
        makeModule({ id: 'm1', title: 'Module A', order: 0 }),
        makeModule({ id: 'm2', title: 'Module B', order: 1 }),
      ]
      const onReorder = vi.fn()
      render(<ModuleList {...defaultProps} modules={modules} onReorder={onReorder} />)

      const items = screen.getAllByTestId('module-item')
      fireEvent.dragStart(items[0], { dataTransfer: { setData: vi.fn(), effectAllowed: '' } })
      fireEvent.drop(items[1], {
        dataTransfer: { getData: () => 'm1', dropEffect: '' },
      })
      expect(onReorder).toHaveBeenCalledWith('m1', 1)
    })

    it('should not call onReorder when dropping a module on itself', () => {
      const mod = makeModule({ id: 'm1', order: 0 })
      const onReorder = vi.fn()
      render(<ModuleList {...defaultProps} modules={[mod]} onReorder={onReorder} />)

      const item = screen.getByTestId('module-item')
      fireEvent.dragStart(item, { dataTransfer: { setData: vi.fn(), effectAllowed: '' } })
      fireEvent.drop(item, {
        dataTransfer: { getData: () => 'm1', dropEffect: '' },
      })
      expect(onReorder).not.toHaveBeenCalled()
    })
  })

  describe('callbacks', () => {
    it('should call onAddModule when add module button clicked', () => {
      const onAddModule = vi.fn()
      render(<ModuleList {...defaultProps} onAddModule={onAddModule} />)
      fireEvent.click(screen.getByTestId('add-module'))
      expect(onAddModule).toHaveBeenCalledOnce()
    })

    it('should call onDeleteModule with module id when delete clicked', () => {
      const mod = makeModule({ id: 'mod-42', title: 'Delete Me' })
      const onDeleteModule = vi.fn()
      render(<ModuleList {...defaultProps} modules={[mod]} onDeleteModule={onDeleteModule} />)
      fireEvent.click(screen.getByTestId('delete-module'))
      expect(onDeleteModule).toHaveBeenCalledWith('mod-42')
    })

    it('should call onAddLesson with module id when add lesson clicked', () => {
      const mod = makeModule({ id: 'mod-1' })
      const onAddLesson = vi.fn()
      render(<ModuleList {...defaultProps} modules={[mod]} onAddLesson={onAddLesson} />)
      fireEvent.click(screen.getByTestId('add-lesson'))
      expect(onAddLesson).toHaveBeenCalledWith('mod-1')
    })
  })

  describe('lesson search & filter', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should render filter controls for each module', () => {
      const mod = makeModule({ id: 'mod-1' })
      render(<ModuleList {...defaultProps} modules={[mod]} />)
      expect(screen.getByTestId('lesson-filter-bar')).toBeDefined()
      expect(screen.getByTestId('lesson-search-input')).toBeDefined()
      expect(screen.getByTestId('max-minutes-input')).toBeDefined()
    })

    it('should filter rendered lessons by search query (debounced)', () => {
      const mod = makeModule({ id: 'mod-1' })
      const lesson1 = makeLesson({ id: 'l1', title: 'Intro Lesson', moduleId: 'mod-1', order: 0, estimatedMinutes: 5 })
      const lesson2 = makeLesson({ id: 'l2', title: 'Advanced Lesson', moduleId: 'mod-1', order: 1, estimatedMinutes: 15 })
      render(
        <ModuleList
          {...defaultProps}
          modules={[mod]}
          lessons={{ 'mod-1': [lesson1, lesson2] }}
        />,
      )

      // Both lessons visible initially
      expect(screen.getByText('Intro Lesson')).toBeDefined()
      expect(screen.getByText('Advanced Lesson')).toBeDefined()

      // Type a query that matches only "Intro"
      act(() => {
        fireEvent.change(screen.getByTestId('lesson-search-input'), { target: { value: 'Intro' } })
      })

      // Before debounce fires, both still visible
      expect(screen.getByText('Intro Lesson')).toBeDefined()
      expect(screen.getByText('Advanced Lesson')).toBeDefined()

      // Advance timers to fire the debounce
      act(() => { vi.advanceTimersByTime(301) })

      // Now only "Intro Lesson" is visible
      expect(screen.getByText('Intro Lesson')).toBeDefined()
      expect(screen.queryByText('Advanced Lesson')).toBeNull()
    })

    it('should filter rendered lessons by maxMinutes', () => {
      const mod = makeModule({ id: 'mod-1' })
      const lesson1 = makeLesson({ id: 'l1', title: 'Short Lesson', moduleId: 'mod-1', order: 0, estimatedMinutes: 5 })
      const lesson2 = makeLesson({ id: 'l2', title: 'Long Lesson', moduleId: 'mod-1', order: 1, estimatedMinutes: 20 })
      const lesson3 = makeLesson({ id: 'l3', title: 'Unknown Lesson', moduleId: 'mod-1', order: 2, estimatedMinutes: null })
      render(
        <ModuleList
          {...defaultProps}
          modules={[mod]}
          lessons={{ 'mod-1': [lesson1, lesson2, lesson3] }}
        />,
      )

      // All three visible initially
      expect(screen.getByText('Short Lesson')).toBeDefined()
      expect(screen.getByText('Long Lesson')).toBeDefined()
      expect(screen.getByText('Unknown Lesson')).toBeDefined()

      // Set maxMinutes to 10 — Long Lesson (20 min) should be hidden
      fireEvent.change(screen.getByTestId('max-minutes-input'), { target: { value: '10' } })

      expect(screen.getByText('Short Lesson')).toBeDefined()
      expect(screen.getByText('Unknown Lesson')).toBeDefined()
      expect(screen.queryByText('Long Lesson')).toBeNull()
    })

    it('should compose search query and maxMinutes filters with AND semantics', () => {
      const mod = makeModule({ id: 'mod-1' })
      const lesson1 = makeLesson({ id: 'l1', title: 'Intro Short', moduleId: 'mod-1', order: 0, estimatedMinutes: 5 })
      const lesson2 = makeLesson({ id: 'l2', title: 'Intro Long', moduleId: 'mod-1', order: 1, estimatedMinutes: 20 })
      const lesson3 = makeLesson({ id: 'l3', title: 'Outro Short', moduleId: 'mod-1', order: 2, estimatedMinutes: 5 })
      render(
        <ModuleList
          {...defaultProps}
          modules={[mod]}
          lessons={{ 'mod-1': [lesson1, lesson2, lesson3] }}
        />,
      )

      // Type "Intro" (debounced)
      act(() => {
        fireEvent.change(screen.getByTestId('lesson-search-input'), { target: { value: 'Intro' } })
        vi.advanceTimersByTime(301)
      })

      // Both Intro lessons visible; Outro Short filtered out by query
      expect(screen.getByText('Intro Short')).toBeDefined()
      expect(screen.getByText('Intro Long')).toBeDefined()
      expect(screen.queryByText('Outro Short')).toBeNull()

      // Now add maxMinutes 10 filter — Intro Long excluded (20 > 10)
      act(() => {
        fireEvent.change(screen.getByTestId('max-minutes-input'), { target: { value: '10' } })
      })

      expect(screen.getByText('Intro Short')).toBeDefined()
      expect(screen.queryByText('Intro Long')).toBeNull() // 20 > 10
      expect(screen.queryByText('Outro Short')).toBeNull() // doesn't match "Intro"
    })

    it('should show all lessons when filters are cleared', () => {
      const mod = makeModule({ id: 'mod-1' })
      const lesson1 = makeLesson({ id: 'l1', title: 'Lesson A', moduleId: 'mod-1', order: 0, estimatedMinutes: 5 })
      const lesson2 = makeLesson({ id: 'l2', title: 'Lesson B', moduleId: 'mod-1', order: 1, estimatedMinutes: 15 })
      render(
        <ModuleList
          {...defaultProps}
          modules={[mod]}
          lessons={{ 'mod-1': [lesson1, lesson2] }}
        />,
      )

      // Apply filters
      act(() => {
        fireEvent.change(screen.getByTestId('lesson-search-input'), { target: { value: 'A' } })
        vi.advanceTimersByTime(301)
      })
      act(() => {
        fireEvent.change(screen.getByTestId('max-minutes-input'), { target: { value: '10' } })
      })

      expect(screen.queryByText('Lesson A')).toBeDefined()
      expect(screen.queryByText('Lesson B')).toBeNull()

      // Clear search
      act(() => {
        fireEvent.change(screen.getByTestId('lesson-search-input'), { target: { value: '' } })
        vi.advanceTimersByTime(301)
      })

      // Clear maxMinutes — set to empty string
      act(() => {
        fireEvent.change(screen.getByTestId('max-minutes-input'), { target: { value: '' } })
      })

      expect(screen.getByText('Lesson A')).toBeDefined()
      expect(screen.getByText('Lesson B')).toBeDefined()
    })
  })
})
