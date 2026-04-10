import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumb } from './breadcrumb'

describe('Breadcrumb', () => {
  it('should render all items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'JavaScript 101' },
    ]
    render(<Breadcrumb items={items} />)
    expect(screen.getByText('Home')).toBeDefined()
    expect(screen.getByText('Courses')).toBeDefined()
    expect(screen.getByText('JavaScript 101')).toBeDefined()
  })

  it('should render links for items with href', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Current' },
    ]
    const { container } = render(<Breadcrumb items={items} />)
    const links = container.querySelectorAll('a')
    expect(links.length).toBe(2)
    expect(links[0].getAttribute('href')).toBe('/')
    expect(links[1].getAttribute('href')).toBe('/courses')
  })

  it('should render last item as plain text', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Current Page' },
    ]
    const { container } = render(<Breadcrumb items={items} />)
    const links = container.querySelectorAll('a')
    expect(links.length).toBe(2)
    const spans = container.querySelectorAll('span')
    const lastSpan = spans[spans.length - 1]
    expect(lastSpan.textContent).toBe('Current Page')
  })

  it('should render separators between items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Current' },
    ]
    const { container } = render(<Breadcrumb items={items} />)
    const separators = container.querySelectorAll('span')
    expect(separators.length).toBe(3)
  })

  it('should handle single item', () => {
    const items = [{ label: 'Home' }]
    render(<Breadcrumb items={items} />)
    expect(screen.getByText('Home')).toBeDefined()
  })

  it('should handle empty items', () => {
    const items: { label: string }[] = []
    const { container } = render(<Breadcrumb items={items} />)
    expect(container.querySelector('ol')).toBeDefined()
    expect(container.querySelectorAll('li').length).toBe(0)
  })
})