import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressRing } from './ProgressRing'

describe('ProgressRing', () => {
  it('renders the percentage text', () => {
    render(<ProgressRing percentage={75} />)
    expect(screen.getByText('75%')).toBeDefined()
  })

  it('renders 0% for no progress', () => {
    render(<ProgressRing percentage={0} />)
    expect(screen.getByText('0%')).toBeDefined()
  })

  it('renders 100% for complete progress', () => {
    render(<ProgressRing percentage={100} />)
    expect(screen.getByText('100%')).toBeDefined()
  })

  it('renders an SVG element', () => {
    const { container } = render(<ProgressRing percentage={50} />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  it('applies correct stroke-dashoffset for progress', () => {
    const { container } = render(<ProgressRing percentage={50} />)
    const circles = container.querySelectorAll('circle')
    const progressCircle = circles[1] // foreground circle
    const circumference = 2 * Math.PI * 40 // radius=40
    const expectedOffset = circumference - (50 / 100) * circumference
    expect(progressCircle?.getAttribute('stroke-dashoffset')).toBe(String(expectedOffset))
  })
})
