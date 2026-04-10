import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumb } from './breadcrumb'

describe('Breadcrumb', () => {
  it('renders navigation with aria-label', () => {
    render(<Breadcrumb items={[{ label: 'Home', href: '/' }]} />)
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeDefined()
  })

  it('renders single item as plain text', () => {
    render(<Breadcrumb items={[{ label: 'Home' }]} />)
    expect(screen.getByText('Home')).toBeDefined()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('renders link for non-active items', () => {
    render(<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Courses' }]} />)
    const link = screen.getByRole('link', { name: 'Home' })
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toBe('/')
  })

  it('renders plain text for active (last) item', () => {
    render(<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Courses' }]} />)
    const activeItem = screen.getByText('Courses')
    expect(activeItem).toBeDefined()
    expect(activeItem.getAttribute('aria-current')).toBe('page')
  })

  it('renders multiple items with correct structure', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Courses', href: '/courses' },
          { label: 'Course 101' },
        ]}
      />
    )
    expect(screen.getByRole('link', { name: 'Home' })).toBeDefined()
    expect(screen.getByRole('link', { name: 'Courses' })).toBeDefined()
    expect(screen.getByText('Course 101')).toBeDefined()
  })

  it('renders separator between items', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Courses', href: '/courses' },
          { label: 'Course 101' },
        ]}
      />
    )
    const separators = screen.getAllByText('/')
    expect(separators).toHaveLength(2)
  })
})