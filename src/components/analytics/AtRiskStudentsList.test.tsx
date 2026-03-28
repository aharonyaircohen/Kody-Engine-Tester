import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AtRiskStudentsList } from './AtRiskStudentsList'

describe('AtRiskStudentsList', () => {
  it('renders empty state when no students', () => {
    render(<AtRiskStudentsList students={[]} />)
    expect(screen.getByText(/No at-risk students/)).toBeDefined()
  })

  it('renders student rows with data', () => {
    render(<AtRiskStudentsList students={[
      { studentId: 's1', studentName: 'Alice', progressPercentage: 20, averageGrade: 45, reason: 'both' },
      { studentId: 's2', studentName: 'Bob', progressPercentage: 30, averageGrade: null, reason: 'low-progress' },
    ]} />)
    expect(screen.getByText('Alice')).toBeDefined()
    expect(screen.getByText('Bob')).toBeDefined()
    expect(screen.getByText('Low Progress & Grade')).toBeDefined()
    expect(screen.getByText('Low Progress')).toBeDefined()
    expect(screen.getByText('N/A')).toBeDefined()
  })
})
