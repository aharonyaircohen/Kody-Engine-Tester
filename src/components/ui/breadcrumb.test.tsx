import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumb } from './breadcrumb'

describe('Breadcrumb', () => {
  it('should render all items as links except the last one', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'JavaScript' },
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
      { label: 'JavaScript' },
    ]
    render(<Breadcrumb items={items} />)

    const activeElement = screen.getByText('JavaScript')
    expect(activeElement.tagName).toBe('SPAN')
    expect(activeElement.getAttribute('aria-current')).toBe('page')
  })

  it('should render single item as plain text when only one item provided', () => {
    const items = [{ label: 'Home' }]
    render(<Breadcrumb items={items} />)

    const activeElement = screen.getByText('Home')
    expect(activeElement.tagName).toBe('SPAN')
  })

  it('should render item without href as plain text even if not last', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses' },
      { label: 'JavaScript' },
    ]
    render(<Breadcrumb items={items} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0].getAttribute('href')).toBe('/')
  })

  it('should have nav element with aria-label', () => {
    const items = [{ label: 'Home', href: '/' }]
    render(<Breadcrumb items={items} />)

    const nav = screen.getByRole('navigation')
    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb')
  })

  it('should render separator between items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'JavaScript' },
    ]
    render(<Breadcrumb items={items} />)

    const separators = document.querySelectorAll('nav span[aria-hidden="true"]')
    expect(separators).toHaveLength(2)
  })
})