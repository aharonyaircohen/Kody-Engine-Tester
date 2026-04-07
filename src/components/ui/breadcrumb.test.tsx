import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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

  it('should render last item as plain text', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Current Lesson' },
    ]
    render(<Breadcrumb items={items} />)

    const lastItem = screen.getByText('Current Lesson')
    expect(lastItem.tagName.toLowerCase()).toBe('span')
    expect(lastItem.getAttribute('href')).toBeNull()
  })

  it('should render non-last items as links when href is provided', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Current Lesson' },
    ]
    render(<Breadcrumb items={items} />)

    const homeLink = screen.getByText('Home')
    expect(homeLink.tagName.toLowerCase()).toBe('a')
    expect(homeLink.getAttribute('href')).toBe('/')

    const coursesLink = screen.getByText('Courses')
    expect(coursesLink.tagName.toLowerCase()).toBe('a')
    expect(coursesLink.getAttribute('href')).toBe('/courses')
  })

  it('should render separators between items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Current Lesson' },
    ]
    render(<Breadcrumb items={items} />)

    const separators = document.body.querySelectorAll('nav span')
    expect(separators.length).toBeGreaterThan(0)
  })

  it('should handle single item', () => {
    const items = [{ label: 'Home' }]
    render(<Breadcrumb items={items} />)

    const homeItem = screen.getByText('Home')
    expect(homeItem.tagName.toLowerCase()).toBe('span')
  })

  it('should handle items without href as plain text', () => {
    const items = [
      { label: 'Home' },
      { label: 'Courses' },
    ]
    render(<Breadcrumb items={items} />)

    expect(screen.getByText('Home').tagName.toLowerCase()).toBe('span')
    expect(screen.getByText('Courses').tagName.toLowerCase()).toBe('span')
  })
})