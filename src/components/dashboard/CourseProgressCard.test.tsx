import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CourseProgressCard } from './CourseProgressCard'

const baseProps = {
  courseTitle: 'Intro to TypeScript',
  percentage: 60,
  grade: 85,
  nextLessonTitle: 'Generics',
  nextLessonHref: '/lessons/3',
}

describe('CourseProgressCard', () => {
  it('renders course title', () => {
    render(<CourseProgressCard {...baseProps} />)
    expect(screen.getByText('Intro to TypeScript')).toBeDefined()
  })

  it('renders progress percentage', () => {
    render(<CourseProgressCard {...baseProps} />)
    expect(screen.getByText('60%')).toBeDefined()
  })

  it('renders grade when provided', () => {
    render(<CourseProgressCard {...baseProps} />)
    expect(screen.getByText(/85/)).toBeDefined()
  })

  it('renders "No grade yet" when grade is null', () => {
    render(<CourseProgressCard {...baseProps} grade={null} />)
    expect(screen.getByText('No grade yet')).toBeDefined()
  })

  it('renders next lesson link', () => {
    render(<CourseProgressCard {...baseProps} />)
    const link = screen.getByRole('link', { name: /Generics/ })
    expect(link.getAttribute('href')).toBe('/lessons/3')
  })

  it('shows completed state at 100%', () => {
    render(
      <CourseProgressCard
        {...baseProps}
        percentage={100}
        nextLessonTitle={null}
        nextLessonHref={null}
      />,
    )
    expect(screen.getByText('100%')).toBeDefined()
    expect(screen.getByText(/completed/i)).toBeDefined()
  })
})
