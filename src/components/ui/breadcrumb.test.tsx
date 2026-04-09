import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumb } from './breadcrumb'

describe('Breadcrumb', () => {
  it('should render all items as links except the last one', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Lesson 1' },
    ]
    render(<Breadcrumb items={items} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0].textContent).toBe('Home')
    expect(links[0].getAttribute('href')).toBe('/')
    expect(links[1].textContent).toBe('Courses')
    expect(links[1].getAttribute('href')).toBe('/courses')
  })

  it('should render last item as plain text', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Current Page' },
    ]
    const { container } = render(<Breadcrumb items={items} />)

    const activeText = screen.getByText('Current Page')
    expect(activeText.tagName.toLowerCase()).toBe('span')
    expect(container.querySelector('.active')).toBeDefined()
  })

  it('should render single item as plain text', () => {
    const items = [{ label: 'Only Page' }]
    render(<Breadcrumb items={items} />)

    const text = screen.getByText('Only Page')
    expect(text.tagName.toLowerCase()).toBe('span')
  })

  it('should render item without href as plain text', () => {
    const items = [
      { label: 'Home' },
      { label: 'Middle' },
      { label: 'End' },
    ]
    render(<Breadcrumb items={items} />)

    const texts = screen.getAllByText(/Home|Middle|End/)
    texts.forEach((text) => {
      expect(text.tagName.toLowerCase()).toBe('span')
    })
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
})