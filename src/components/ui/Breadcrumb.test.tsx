import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumb } from './Breadcrumb'

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

  it('should render last item as plain text', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Current Lesson' },
    ]
    render(<Breadcrumb items={items} />)
    const lastItem = screen.getByText('Current Lesson')
    expect(lastItem.tagName.toLowerCase()).toBe('span')
    expect(lastItem.className).toContain('active')
  })

  it('should render links for non-last items with href', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Current Lesson' },
    ]
    render(<Breadcrumb items={items} />)
    const homeLink = screen.getByText('Home').closest('a')
    expect(homeLink).toBeDefined()
    expect(homeLink?.getAttribute('href')).toBe('/')
    const coursesLink = screen.getByText('Courses').closest('a')
    expect(coursesLink).toBeDefined()
    expect(coursesLink?.getAttribute('href')).toBe('/courses')
  })

  it('should render plain text for items without href', () => {
    const items = [{ label: 'No Link' }]
    render(<Breadcrumb items={items} />)
    const item = screen.getByText('No Link')
    expect(item.tagName.toLowerCase()).toBe('span')
  })

  it('should render separators between items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Lesson' },
    ]
    render(<Breadcrumb items={items} />)
    const separators = screen.getAllByText('/')
    expect(separators).toHaveLength(2)
  })

  it('should render single item correctly', () => {
    const items = [{ label: 'Only Item' }]
    const { container } = render(<Breadcrumb items={items} />)
    expect(container.textContent).toContain('Only Item')
  })
})