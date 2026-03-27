import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  it('should render with placeholder', () => {
    render(<SearchBar value="" onChange={vi.fn()} placeholder="Search..." />)
    expect(screen.getByPlaceholderText('Search...')).toBeDefined()
  })

  it('should display the current value', () => {
    render(<SearchBar value="hello" onChange={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveProperty('value', 'hello')
  })

  it('should call onChange when typing', () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
    expect(onChange).toHaveBeenCalledWith('test')
  })
})
