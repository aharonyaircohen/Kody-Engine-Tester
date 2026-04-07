import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumb } from './breadcrumb'

describe('Breadcrumb', () => {
  it('should render all items as links except the last one', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'JavaScript Basics' },
    ]
    render(<Breadcrumb items={items} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0].textContent).toBe('Home')
    expect(links[1].textContent).toBe('Courses')
  })

  it('should render the last item as plain text', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'JavaScript Basics' },
    ]
    render(<Breadcrumb items={items} />)

    const activeSpan = screen.getByText('JavaScript Basics')
    expect(activeSpan).toBeDefined()
    expect(activeSpan.getAttribute('aria-current')).toBe('page')
  })

  it('should render single item as active plain text', () => {
    const items = [{ label: 'Home' }]
    render(<Breadcrumb items={items} />)

    const activeSpan = screen.getByText('Home')
    expect(activeSpan).toBeDefined()
    expect(activeSpan.getAttribute('aria-current')).toBe('page')
  })

  it('should render separators between non-active items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'JavaScript Basics' },
    ]
    render(<Breadcrumb items={items} />)

    const separators = document.body.querySelectorAll('nav span[aria-hidden="true"]')
    expect(separators).toHaveLength(2)
  })

  it('should apply correct CSS classes', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Course' },
    ]
    const { container } = render(<Breadcrumb items={items} />)

    expect(container.querySelector('nav')).toBeDefined()
    expect(container.querySelector('ol')).toBeDefined()
  })
})