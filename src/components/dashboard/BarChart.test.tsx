import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BarChart } from './BarChart'

describe('BarChart', () => {
  it('renders an SVG element', () => {
    const { container } = render(
      <BarChart data={[{ label: 'A', value: 50 }]} />,
    )
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  it('renders bars for each data item', () => {
    const data = [
      { label: 'Math', value: 80 },
      { label: 'Science', value: 90 },
      { label: 'History', value: 70 },
    ]
    const { container } = render(<BarChart data={data} />)
    const rects = container.querySelectorAll('rect')
    expect(rects.length).toBe(data.length)
  })

  it('displays value labels above bars', () => {
    const data = [{ label: 'Test', value: 75 }]
    render(<BarChart data={data} />)
    expect(screen.getByText('75')).toBeDefined()
  })

  it('displays labels on x-axis', () => {
    const data = [{ label: 'Course A', value: 60 }]
    render(<BarChart data={data} />)
    expect(screen.getByText('Course A')).toBeDefined()
  })

  it('handles empty data array', () => {
    const { container } = render(<BarChart data={[]} />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  it('uses custom color when provided', () => {
    const data = [{ label: 'Test', value: 50, color: '#ff0000' }]
    const { container } = render(<BarChart data={data} />)
    const rect = container.querySelector('rect')
    expect(rect?.getAttribute('fill')).toBe('#ff0000')
  })

  it('uses default color when not provided', () => {
    const data = [{ label: 'Test', value: 50 }]
    const { container } = render(<BarChart data={data} />)
    const rect = container.querySelector('rect')
    expect(rect?.getAttribute('fill')).toBe('#3b82f6')
  })
})
