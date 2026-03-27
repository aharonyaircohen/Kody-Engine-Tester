import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PasswordStrengthBar } from './PasswordStrengthBar'

describe('PasswordStrengthBar', () => {
  it('renders nothing for empty password', () => {
    const { container } = render(<PasswordStrengthBar password="" />)
    expect(container.firstChild).toBeNull()
  })

  it('shows weak for short password', () => {
    render(<PasswordStrengthBar password="ab" />)
    expect(screen.getByText('Weak')).toBeDefined()
  })

  it('shows medium for partial requirements', () => {
    render(<PasswordStrengthBar password="Abcdefg1" />) // missing special char
    expect(screen.getByText('Medium')).toBeDefined()
  })

  it('shows strong for all requirements met', () => {
    render(<PasswordStrengthBar password="Abcdefg1!" />)
    expect(screen.getByText('Strong')).toBeDefined()
  })
})
