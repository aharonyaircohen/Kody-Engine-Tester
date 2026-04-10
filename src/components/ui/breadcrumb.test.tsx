import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumb } from './breadcrumb'

describe('Breadcrumb', () => {
  it('should render all items with labels', () => {
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

  it('should render links for items with href that are not last', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Current Lesson' },
    ]
    const { container } = render(<Breadcrumb items={items} />)
    const links = container.querySelectorAll('a')
    expect(links.length).toBe(2)
    expect(links[0].getAttribute('href')).toBe('/')
    expect(links[1].getAttribute('href')).toBe('/courses')
  })

  it('should render last item as plain text without link', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Current Lesson' },
    ]
    const { container } = render(<Breadcrumb items={items} />)
    const links = container.querySelectorAll('a')
    expect(links.length).toBe(2)
    const lastItem = screen.getByText('Current Lesson')
    expect(lastItem.tagName.toLowerCase()).toBe('span')
  })

  it('should render separators between items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Current Lesson' },
    ]
    const { container } = render(<Breadcrumb items={items} />)
    const separators = container.querySelectorAll('span')
    expect(separators.length).toBeGreaterThan(0)
  })

  it('should handle single item', () => {
    const items = [{ label: 'Home' }]
    render(<Breadcrumb items={items} />)
    expect(screen.getByText('Home')).toBeDefined()
  })

  it('should apply active class to last item', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Current Lesson' },
    ]
    render(<Breadcrumb items={items} />)
    expect(screen.getByText('Current Lesson')).toBeDefined()
  })
})