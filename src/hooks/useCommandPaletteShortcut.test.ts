import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCommandPaletteShortcut } from './useCommandPaletteShortcut'

describe('useCommandPaletteShortcut', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls onOpen when Cmd+K is pressed', () => {
    const onOpen = vi.fn()
    renderHook(() => useCommandPaletteShortcut(onOpen))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
    expect(onOpen).toHaveBeenCalledOnce()
  })

  it('calls onOpen when Ctrl+K is pressed', () => {
    const onOpen = vi.fn()
    renderHook(() => useCommandPaletteShortcut(onOpen))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
    expect(onOpen).toHaveBeenCalledOnce()
  })

  it('does not call onOpen for unrelated keys', () => {
    const onOpen = vi.fn()
    renderHook(() => useCommandPaletteShortcut(onOpen))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', metaKey: true }))
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('removes event listener on unmount', () => {
    const onOpen = vi.fn()
    const { unmount } = renderHook(() => useCommandPaletteShortcut(onOpen))
    unmount()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
    expect(onOpen).not.toHaveBeenCalled()
  })
})
