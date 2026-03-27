import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ContactAvatar } from './ContactAvatar'

describe('ContactAvatar', () => {
  it('should render initials from firstName and lastName', () => {
    render(<ContactAvatar firstName="Alice" lastName="Smith" />)
    expect(screen.getByText('AS')).toBeDefined()
  })

  it('should render single initial when lastName is absent', () => {
    render(<ContactAvatar firstName="Bob" lastName="" />)
    expect(screen.getByText('B')).toBeDefined()
  })

  it('should render two initials even with single-char lastName', () => {
    render(<ContactAvatar firstName="Carol" lastName="X" />)
    expect(screen.getByText('CX')).toBeDefined()
  })

  it('should render same initials for same name', () => {
    const { container: c1 } = render(<ContactAvatar firstName="Dave" lastName="Jones" />)
    const { container: c2 } = render(<ContactAvatar firstName="Dave" lastName="Jones" />)
    expect(c1.innerHTML).toBe(c2.innerHTML)
  })

  it('should render different initials for different names', () => {
    const { container: c1 } = render(<ContactAvatar firstName="Eve" lastName="Green" />)
    const { container: c2 } = render(<ContactAvatar firstName="Frank" lastName="Harris" />)
    expect(c1.innerHTML).not.toBe(c2.innerHTML)
  })
})
