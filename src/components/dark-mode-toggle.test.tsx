import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { DarkModeToggle } from './dark-mode-toggle'

// Store reference that can be manipulated
let localStorageStore: Record<string, string> = {}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key]
  }),
  clear: () => {
    localStorageStore = {}
  },
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock matchMedia
const matchMediaMock = vi.fn((query: string) => ({
  matches: query === '(prefers-color-scheme: dark)',
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))

Object.defineProperty(window, 'matchMedia', {
  value: matchMediaMock,
  writable: true,
})

describe('DarkModeToggle', () => {
  beforeEach(() => {
    localStorageStore = {}
    localStorageMock.getItem.mockImplementation((key: string) => localStorageStore[key] ?? null)
    localStorageMock.setItem.mockImplementation((key: string, value: string) => {
      localStorageStore[key] = value
    })
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    vi.clearAllMocks()
  })

  describe('initial render with dark system preference', () => {
    it('renders button with correct aria-label for dark mode', () => {
      render(<DarkModeToggle />)
      expect(screen.getByRole('button')).toBeDefined()
      expect(screen.getByLabelText('Switch to light mode')).toBeDefined()
    })

    it('renders with sun icon when system preference is dark', () => {
      render(<DarkModeToggle />)
      const button = screen.getByTestId('dark-mode-toggle')
      expect(button.querySelector('svg')).toBeDefined()
    })
  })

  describe('initial render with light system preference', () => {
    it('renders button with correct aria-label for light mode', () => {
      matchMediaMock.mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
      render(<DarkModeToggle />)
      expect(screen.getByLabelText('Switch to dark mode')).toBeDefined()
    })
  })

  describe('toggle behavior from dark mode', () => {
    it('toggles theme from dark to light on click', () => {
      render(<DarkModeToggle />)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(screen.getByLabelText('Switch to dark mode')).toBeDefined()
    })

    it('toggles theme from light to dark on second click', () => {
      render(<DarkModeToggle />)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      fireEvent.click(button)
      expect(screen.getByLabelText('Switch to light mode')).toBeDefined()
    })

    it('persists theme to localStorage on toggle', () => {
      render(<DarkModeToggle />)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme-preference', 'light')
    })
  })

  describe('data-theme attribute', () => {
    it('sets data-theme attribute to light when toggled', () => {
      render(<DarkModeToggle />)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    it('sets data-theme to dark when toggled back', () => {
      render(<DarkModeToggle />)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      fireEvent.click(button)
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })
  })

  describe('onToggle callback', () => {
    it('calls onToggle callback with light when toggling from dark', () => {
      const onToggle = vi.fn()
      render(<DarkModeToggle onToggle={onToggle} />)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(onToggle).toHaveBeenCalledWith('light')
    })

    it('calls onToggle with dark theme on second toggle', () => {
      const onToggle = vi.fn()
      render(<DarkModeToggle onToggle={onToggle} />)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      fireEvent.click(button)
      expect(onToggle).toHaveBeenCalledWith('dark')
    })
  })

  describe('localStorage integration', () => {
    it('uses stored light theme from localStorage on mount', () => {
      localStorageStore['theme-preference'] = 'light'
      render(<DarkModeToggle />)
      expect(screen.getByLabelText('Switch to dark mode')).toBeDefined()
    })

    it('prefers stored theme over system preference', () => {
      localStorageStore['theme-preference'] = 'light'
      render(<DarkModeToggle />)
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    it('uses stored dark theme from localStorage', () => {
      localStorageStore['theme-preference'] = 'dark'
      render(<DarkModeToggle />)
      expect(screen.getByLabelText('Switch to light mode')).toBeDefined()
    })
  })
})