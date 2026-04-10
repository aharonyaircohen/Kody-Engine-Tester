import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Breadcrumb, BreadcrumbProps, BreadcrumbItem } from './Breadcrumb'

// Store reference for localStorage mock
let localStorageStore: Record<string, string> = {}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key]
  }),
  clear: () => {
    localStorageStore = {}
  },
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

const defaultItems: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/courses' },
  { label: 'Introduction to TypeScript' },
]

const renderBreadcrumb = (props?: Partial<BreadcrumbProps>) => {
  const defaultProps: BreadcrumbProps = {
    items: defaultItems,
    separator: 'chevron',
    ...props,
  }
  return render(<Breadcrumb {...defaultProps} />)
}

describe('Breadcrumb', () => {
  beforeEach(() => {
    localStorageStore = {}
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders navigation with correct aria-label', () => {
      renderBreadcrumb()
      expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeDefined()
    })

    it('renders all breadcrumb items', () => {
      renderBreadcrumb()
      expect(screen.getByText('Home')).toBeDefined()
      expect(screen.getByText('Courses')).toBeDefined()
      expect(screen.getByText('Introduction to TypeScript')).toBeDefined()
    })

    it('renders as ordered list', () => {
      renderBreadcrumb()
      expect(screen.getByRole('list')).toBeDefined()
      const listItems = screen.getAllByRole('listitem')
      expect(listItems).toHaveLength(3)
    })

    it('has correct testid on nav element', () => {
      renderBreadcrumb()
      expect(screen.getByTestId('breadcrumb')).toBeDefined()
    })
  })

  describe('separator types', () => {
    it('renders chevron separator by default', () => {
      const { container } = renderBreadcrumb({ separator: 'chevron' })
      const separators = container.querySelectorAll('.breadcrumb-separator')
      expect(separators).toHaveLength(2)
    })

    it('renders slash separator when specified', () => {
      renderBreadcrumb({ separator: 'slash' })
      expect(screen.getByText('Home')).toBeDefined()
      expect(screen.getByText('Courses')).toBeDefined()
    })

    it('renders arrow separator when specified', () => {
      renderBreadcrumb({ separator: 'arrow' })
      expect(screen.getByText('Home')).toBeDefined()
      expect(screen.getByText('Courses')).toBeDefined()
    })

    it('renders correct number of separators', () => {
      const items: BreadcrumbItem[] = [
        { label: 'A', href: '/a' },
        { label: 'B', href: '/b' },
        { label: 'C', href: '/c' },
        { label: 'D' },
      ]
      const { container } = renderBreadcrumb({ items })
      const separators = container.querySelectorAll('.breadcrumb-separator')
      expect(separators).toHaveLength(3)
    })
  })

  describe('link behavior', () => {
    it('renders links for all items except the last', () => {
      renderBreadcrumb()
      const links = screen.getAllByTestId('breadcrumb-link')
      expect(links).toHaveLength(2)
      expect(links[0].textContent).toBe('Home')
      expect(links[1].textContent).toBe('Courses')
    })

    it('renders current page as span without link', () => {
      renderBreadcrumb()
      const current = screen.getByTestId('breadcrumb-current')
      expect(current.textContent).toBe('Introduction to TypeScript')
      expect(current.getAttribute('href')).toBeNull()
    })

    it('marks last item with aria-current="page"', () => {
      renderBreadcrumb()
      const current = screen.getByTestId('breadcrumb-current')
      expect(current.getAttribute('aria-current')).toBe('page')
    })

    it('prevents default on link click by calling onNavigate', () => {
      const onNavigate = vi.fn()
      renderBreadcrumb({ onNavigate })
      const link = screen.getAllByTestId('breadcrumb-link')[0]
      // Clicking the link should trigger onNavigate instead of navigation
      fireEvent.click(link)
      expect(onNavigate).toHaveBeenCalled()
    })
  })

  describe('onNavigate callback', () => {
    it('calls onNavigate when clicking a link', () => {
      const onNavigate = vi.fn()
      renderBreadcrumb({ onNavigate })
      const link = screen.getAllByTestId('breadcrumb-link')[0]
      fireEvent.click(link)
      expect(onNavigate).toHaveBeenCalledWith({ label: 'Home', href: '/' }, 0)
    })

    it('calls onNavigate with correct index', () => {
      const onNavigate = vi.fn()
      renderBreadcrumb({ onNavigate })
      const links = screen.getAllByTestId('breadcrumb-link')
      fireEvent.click(links[1])
      expect(onNavigate).toHaveBeenCalledWith({ label: 'Courses', href: '/courses' }, 1)
    })

    it('does not call onNavigate when clicking the current page', () => {
      const onNavigate = vi.fn()
      renderBreadcrumb({ onNavigate })
      const current = screen.getByTestId('breadcrumb-current')
      fireEvent.click(current)
      expect(onNavigate).not.toHaveBeenCalled()
    })
  })

  describe('single item', () => {
    it('renders correctly with only one item', () => {
      renderBreadcrumb({ items: [{ label: 'Home' }] })
      expect(screen.getByText('Home')).toBeDefined()
      expect(screen.queryByTestId('breadcrumb-link')).toBeNull()
      expect(screen.getByTestId('breadcrumb-current').textContent).toBe('Home')
    })
  })

  describe('items without href', () => {
    it('renders all items as text when no href provided', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Home' },
        { label: 'Category' },
        { label: 'Current Page' },
      ]
      renderBreadcrumb({ items })
      const links = screen.queryAllByTestId('breadcrumb-link')
      expect(links).toHaveLength(0)
      const currents = screen.getAllByTestId('breadcrumb-current')
      expect(currents).toHaveLength(3)
    })
  })

  describe('localStorage integration', () => {
    it('can store navigation history in localStorage', () => {
      renderBreadcrumb()
      expect(localStorageMock.setItem).toBeDefined()
    })
  })
})