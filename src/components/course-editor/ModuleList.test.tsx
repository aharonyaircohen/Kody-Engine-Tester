import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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
      const module = makeModule({ title: 'Intro to React' })
      render(<ModuleList {...defaultProps} modules={[module]} />)
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
      const module = makeModule()
      const lesson = makeLesson({ title: 'Hello World Lesson' })
      render(
        <ModuleList
          {...defaultProps}
          modules={[module]}
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
      const module = makeModule({ id: 'm1', order: 0 })
      const onReorder = vi.fn()
      render(<ModuleList {...defaultProps} modules={[module]} onReorder={onReorder} />)

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
      const module = makeModule({ id: 'mod-42', title: 'Delete Me' })
      const onDeleteModule = vi.fn()
      render(<ModuleList {...defaultProps} modules={[module]} onDeleteModule={onDeleteModule} />)
      fireEvent.click(screen.getByTestId('delete-module'))
      expect(onDeleteModule).toHaveBeenCalledWith('mod-42')
    })

    it('should call onAddLesson with module id when add lesson clicked', () => {
      const module = makeModule({ id: 'mod-1' })
      const onAddLesson = vi.fn()
      render(<ModuleList {...defaultProps} modules={[module]} onAddLesson={onAddLesson} />)
      fireEvent.click(screen.getByTestId('add-lesson'))
      expect(onAddLesson).toHaveBeenCalledWith('mod-1')
    })
  })
})
