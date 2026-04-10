import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumb } from './breadcrumb'

describe('Breadcrumb', () => {
  it('should render all items as links except the last one', () => {
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

  it('should render the last item as plain text', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Current Page' },
    ]
    render(<Breadcrumb items={items} />)

    const lastItem = screen.getByText('Current Page')
    expect(lastItem.tagName).toBe('SPAN')
  })

  it('should render links for non-last items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Current' },
    ]
    render(<Breadcrumb items={items} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0].getAttribute('href')).toBe('/')
    expect(links[1].getAttribute('href')).toBe('/courses')
  })

  it('should render a single item as plain text', () => {
    const items = [{ label: 'Only Page' }]
    render(<Breadcrumb items={items} />)

    const item = screen.getByText('Only Page')
    expect(item.tagName).toBe('SPAN')
  })

  it('should use # as default href when href is not provided', () => {
    const items = [
      { label: 'Home' },
      { label: 'Page' },
    ]
    render(<Breadcrumb items={items} />)

    const link = screen.getByText('Home')
    expect(link.getAttribute('href')).toBe('#')
  })
})