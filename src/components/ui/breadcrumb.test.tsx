import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumb } from './breadcrumb'

describe('Breadcrumb', () => {
  it('renders breadcrumb with multiple items', () => {
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

  it('renders links for all items except the last one', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Introduction' },
    ]
    render(<Breadcrumb items={items} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0].getAttribute('href')).toBe('/')
    expect(links[1].getAttribute('href')).toBe('/courses')
  })

  it('renders last item as plain text without link', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Current Lesson' },
    ]
    render(<Breadcrumb items={items} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(screen.queryByRole('link', { name: 'Current Lesson' })).toBeNull()
  })

  it('renders aria-current="page" on the last item', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Introduction' },
    ]
    render(<Breadcrumb items={items} />)

    const activeItem = screen.getByText('Introduction')
    expect(activeItem.getAttribute('aria-current')).toBe('page')
  })

  it('renders single item as active plain text', () => {
    const items = [{ label: 'Home' }]
    render(<Breadcrumb items={items} />)

    const links = screen.queryAllByRole('link')
    expect(links).toHaveLength(0)
    expect(screen.getByText('Home').getAttribute('aria-current')).toBe('page')
  })

  it('renders empty breadcrumb gracefully', () => {
    const items: { label: string; href?: string }[] = []
    render(<Breadcrumb items={items} />)

    expect(screen.queryByRole('list')).toBeNull()
  })

  it('renders separators between items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Lesson' },
    ]
    render(<Breadcrumb items={items} />)

    const separators = document.querySelectorAll('.breadcrumb-separator')
    expect(separators).toHaveLength(2)
  })
})