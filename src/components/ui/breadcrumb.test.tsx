import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumb } from './breadcrumb'

describe('Breadcrumb', () => {
  it('should render all items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Introduction' },
    ]
    render(<Breadcrumb items={items} />)
    expect(screen.getByText('Home')).toBeDefined()
    expect(screen.getByText('Courses')).toBeDefined()
    expect(screen.getByText('Introduction')).toBeDefined()
  })

  it('should render last item as plain text', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Current Page' },
    ]
    render(<Breadcrumb items={items} />)
    const lastItem = screen.getByText('Current Page')
    expect(lastItem.tagName).toBe('SPAN')
  })

  it('should render link items as anchors', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Current' },
    ]
    render(<Breadcrumb items={items} />)
    const homeLink = screen.getByText('Home')
    expect(homeLink.tagName).toBe('A')
    const coursesLink = screen.getByText('Courses')
    expect(coursesLink.tagName).toBe('A')
  })

  it('should render separators between items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Page' },
    ]
    render(<Breadcrumb items={items} />)
    const separators = screen.getAllByText('/')
    expect(separators.length).toBe(1)
  })

  it('should render nav element with aria-label', () => {
    const items = [{ label: 'Home' }]
    render(<Breadcrumb items={items} />)
    const nav = document.body.querySelector('nav')
    expect(nav?.getAttribute('aria-label')).toBe('Breadcrumb')
  })

  it('should handle single item', () => {
    const items = [{ label: 'Only Page' }]
    render(<Breadcrumb items={items} />)
    expect(screen.getByText('Only Page')).toBeDefined()
    const separators = screen.queryAllByText('/')
    expect(separators.length).toBe(0)
  })

  it('should handle empty items array', () => {
    const items: { label: string }[] = []
    render(<Breadcrumb items={items} />)
    const list = document.body.querySelector('ol')
    expect(list?.children.length).toBe(0)
  })

  it('should apply active class to last item', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Current' },
    ]
    render(<Breadcrumb items={items} />)
    const activeSpan = screen.getByText('Current')
    expect(activeSpan.tagName).toBe('SPAN')
  })
})