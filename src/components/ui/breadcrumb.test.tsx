import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Breadcrumb } from './breadcrumb'

describe('Breadcrumb', () => {
  it('renders the breadcrumb navigation', () => {
    render(<Breadcrumb items={[]} />)
    expect(screen.getByRole('navigation')).toBeDefined()
  })

  it('renders all items as links except the last one', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Current Page' },
    ]
    render(<Breadcrumb items={items} />)

    const links = screen.getAllByRole('link')
    expect(links.length).toBe(2)
    expect(links[0].textContent).toBe('Home')
    expect(links[1].textContent).toBe('Courses')
  })

  it('renders the last item as plain text with aria-current', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Current Page' },
    ]
    render(<Breadcrumb items={items} />)

    const currentPage = screen.getByText('Current Page')
    expect(currentPage.getAttribute('aria-current')).toBe('page')
  })

  it('renders single item as plain text', () => {
    const items = [{ label: 'Only Page' }]
    render(<Breadcrumb items={items} />)

    const page = screen.getByText('Only Page')
    expect(page.getAttribute('aria-current')).toBe('page')
  })

  it('renders empty breadcrumb when no items', () => {
    render(<Breadcrumb items={[]} />)
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('applies correct hrefs to links', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Profile', href: '/profile' },
    ]
    render(<Breadcrumb items={items} />)

    const links = screen.getAllByRole('link')
    expect(links.length).toBe(2)
    expect(links[0].getAttribute('href')).toBe('/')
    expect(links[1].getAttribute('href')).toBe('/courses')
  })
})