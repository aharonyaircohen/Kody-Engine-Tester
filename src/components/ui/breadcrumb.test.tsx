import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Breadcrumb } from './breadcrumb'

describe('Breadcrumb', () => {
  describe('rendering', () => {
    it('renders breadcrumb with correct aria-label', () => {
      render(<Breadcrumb items={[{ label: 'Home', href: '/' }]} />)
      expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeDefined()
    })

    it('renders breadcrumb with testid', () => {
      render(<Breadcrumb items={[{ label: 'Home', href: '/' }]} />)
      expect(screen.getByTestId('breadcrumb')).toBeDefined()
    })

    it('renders all items', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Courses', href: '/courses' },
        { label: 'Current Lesson' },
      ]
      render(<Breadcrumb items={items} />)
      expect(screen.getByText('Home')).toBeDefined()
      expect(screen.getByText('Courses')).toBeDefined()
      expect(screen.getByText('Current Lesson')).toBeDefined()
    })
  })

  describe('single item', () => {
    it('renders single item as active (plain text)', () => {
      render(<Breadcrumb items={[{ label: 'Home' }]} />)
      expect(screen.getByTestId('breadcrumb-active')).toBeDefined()
      expect(screen.getByTestId('breadcrumb-active').textContent).toBe('Home')
    })
  })

  describe('multiple items', () => {
    it('renders non-last items as links', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Courses', href: '/courses' },
        { label: 'Current Lesson' },
      ]
      render(<Breadcrumb items={items} />)
      const links = screen.getAllByTestId('breadcrumb-link')
      expect(links).toHaveLength(2)
      expect(links[0].textContent).toBe('Home')
      expect(links[1].textContent).toBe('Courses')
    })

    it('renders last item as active plain text', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Courses', href: '/courses' },
        { label: 'Current Lesson' },
      ]
      render(<Breadcrumb items={items} />)
      const active = screen.getByTestId('breadcrumb-active')
      expect(active.textContent).toBe('Current Lesson')
      expect(active.getAttribute('aria-current')).toBe('page')
    })

    it('renders href on link items', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Courses', href: '/courses' },
        { label: 'Current Lesson' },
      ]
      render(<Breadcrumb items={items} />)
      const links = screen.getAllByTestId('breadcrumb-link')
      expect(links[0].getAttribute('href')).toBe('/')
      expect(links[1].getAttribute('href')).toBe('/courses')
    })
  })

  describe('chevron separators', () => {
    it('renders chevron between items', () => {
      const items = [
        { label: 'Home', href: '/' },
        { label: 'Courses', href: '/courses' },
        { label: 'Current Lesson' },
      ]
      render(<Breadcrumb items={items} />)
      const chevrons = screen.getAllByTestId('breadcrumb')
        .at(0)!
        .querySelectorAll('svg')
      expect(chevrons).toHaveLength(2)
    })

    it('renders no chevron after last item', () => {
      const items = [{ label: 'Home' }]
      render(<Breadcrumb items={items} />)
      const nav = screen.getByTestId('breadcrumb')
      const svgElements = nav.querySelectorAll('svg')
      expect(svgElements).toHaveLength(0)
    })
  })

  describe('items without href', () => {
    it('renders all items as text when no items have href', () => {
      const items = [
        { label: 'Home' },
        { label: 'Courses' },
        { label: 'Current Lesson' },
      ]
      render(<Breadcrumb items={items} />)
      const textElements = screen.getAllByTestId('breadcrumb-text')
      const activeElements = screen.getAllByTestId('breadcrumb-active')
      expect(textElements).toHaveLength(2)
      expect(activeElements).toHaveLength(1)
    })
  })
})