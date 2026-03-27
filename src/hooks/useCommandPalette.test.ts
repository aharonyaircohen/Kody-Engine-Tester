import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCommandPalette } from './useCommandPalette'
import type { Command } from './useCommandPalette'

const commands: Command[] = [
  { id: 'new-note', label: 'New Note', action: vi.fn(), category: 'Notes' },
  { id: 'open-settings', label: 'Open Settings', action: vi.fn(), category: 'App' },
  { id: 'search-notes', label: 'Search Notes', action: vi.fn(), category: 'Notes' },
]

describe('useCommandPalette', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('open/close', () => {
    it('should start closed', () => {
      const { result } = renderHook(() => useCommandPalette(commands))
      expect(result.current.isOpen).toBe(false)
    })

    it('should open and close', () => {
      const { result } = renderHook(() => useCommandPalette(commands))
      act(() => result.current.open())
      expect(result.current.isOpen).toBe(true)
      act(() => result.current.close())
      expect(result.current.isOpen).toBe(false)
    })
  })

  describe('search filtering', () => {
    it('should return all commands when query is empty', () => {
      const { result } = renderHook(() => useCommandPalette(commands))
      expect(result.current.filtered).toHaveLength(3)
    })

    it('should filter commands by label case-insensitively', () => {
      const { result } = renderHook(() => useCommandPalette(commands))
      act(() => result.current.setQuery('note'))
      expect(result.current.filtered).toHaveLength(2)
      expect(result.current.filtered.map((c) => c.id)).toEqual(['new-note', 'search-notes'])
    })

    it('should return empty array when no commands match', () => {
      const { result } = renderHook(() => useCommandPalette(commands))
      act(() => result.current.setQuery('xyz'))
      expect(result.current.filtered).toHaveLength(0)
    })
  })

  describe('recent commands', () => {
    it('should start with no recent commands', () => {
      const { result } = renderHook(() => useCommandPalette(commands))
      expect(result.current.recentIds).toHaveLength(0)
    })

    it('should record a command as recent after execute', () => {
      const { result } = renderHook(() => useCommandPalette(commands))
      act(() => result.current.execute(commands[0]))
      expect(result.current.recentIds).toContain('new-note')
    })

    it('should keep at most 5 recent commands', () => {
      const manyCommands: Command[] = Array.from({ length: 7 }, (_, i) => ({
        id: `cmd-${i}`,
        label: `Command ${i}`,
        action: vi.fn(),
      }))
      const { result } = renderHook(() => useCommandPalette(manyCommands))
      manyCommands.forEach((c) => act(() => result.current.execute(c)))
      expect(result.current.recentIds).toHaveLength(5)
    })

    it('should move an already-recent command to front on re-execute', () => {
      const { result } = renderHook(() => useCommandPalette(commands))
      act(() => result.current.execute(commands[0]))
      act(() => result.current.execute(commands[1]))
      act(() => result.current.execute(commands[0]))
      expect(result.current.recentIds[0]).toBe('new-note')
      expect(result.current.recentIds).toHaveLength(2)
    })

    it('should persist recent commands to localStorage', () => {
      const { result } = renderHook(() => useCommandPalette(commands))
      act(() => result.current.execute(commands[0]))
      const stored = JSON.parse(localStorage.getItem('command-palette-recent') ?? '[]')
      expect(stored).toContain('new-note')
    })

    it('should read recent commands from localStorage on mount', () => {
      localStorage.setItem('command-palette-recent', JSON.stringify(['open-settings']))
      const { result } = renderHook(() => useCommandPalette(commands))
      expect(result.current.recentIds).toContain('open-settings')
    })
  })
})
