import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Breadcrumb } from './breadcrumb'

describe('Breadcrumb', () => {
  it('should render all items', () => {
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

  it('should render links for non-active items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Current Lesson' },
    ]
    render(<Breadcrumb items={items} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0].getAttribute('href')).toBe('/')
    expect(links[1].getAttribute('href')).toBe('/courses')
  })

  it('should render last item as plain text without link', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Current Lesson' },
    ]
    render(<Breadcrumb items={items} />)
    const activeSpan = screen.getByText('Current Lesson')
    expect(activeSpan.tagName.toLowerCase()).toBe('span')
    expect(activeSpan.className).toContain('breadcrumb-active')
  })

  it('should render single item as active plain text', () => {
    const items = [{ label: 'Only Item' }]
    render(<Breadcrumb items={items} />)
    const activeSpan = screen.getByText('Only Item')
    expect(activeSpan.tagName.toLowerCase()).toBe('span')
    expect(activeSpan.className).toContain('breadcrumb-active')
  })

  it('should return null for empty items array', () => {
    const { container } = render(<Breadcrumb items={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render separator between items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Lesson' },
    ]
    render(<Breadcrumb items={items} />)
    const separators = screen.getAllByTestId('breadcrumb-separator-icon')
    expect(separators).toHaveLength(2)
  })

  it('should have proper aria-label on nav element', () => {
    const items = [{ label: 'Test' }]
    render(<Breadcrumb items={items} />)
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(nav).toBeDefined()
  })

  it('should render items without href as plain text', () => {
    const items = [
      { label: 'Home' },
      { label: 'Courses' },
    ]
    render(<Breadcrumb items={items} />)
    const spans = screen.getAllByText(/Home|Courses/)
    spans.forEach((span) => {
      expect(span.tagName.toLowerCase()).toBe('span')
    })
  })
})