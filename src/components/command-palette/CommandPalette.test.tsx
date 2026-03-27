import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CommandPalette } from './CommandPalette'
import type { Command } from '@/hooks/useCommandPalette'

const commands: Command[] = [
  { id: 'new-note', label: 'New Note', action: vi.fn(), category: 'Notes' },
  { id: 'search-notes', label: 'Search Notes', action: vi.fn(), category: 'Notes' },
  { id: 'open-settings', label: 'Open Settings', action: vi.fn(), category: 'App' },
]

describe('CommandPalette', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('open/close', () => {
    it('renders nothing when closed', () => {
      render(<CommandPalette isOpen={false} commands={commands} onClose={vi.fn()} onExecute={vi.fn()} query="" onQueryChange={vi.fn()} filtered={commands} recentIds={[]} />)
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('renders dialog when open', () => {
      render(<CommandPalette isOpen={true} commands={commands} onClose={vi.fn()} onExecute={vi.fn()} query="" onQueryChange={vi.fn()} filtered={commands} recentIds={[]} />)
      expect(screen.getByRole('dialog')).toBeDefined()
    })

    it('calls onClose when Escape key is pressed', () => {
      const onClose = vi.fn()
      render(<CommandPalette isOpen={true} commands={commands} onClose={onClose} onExecute={vi.fn()} query="" onQueryChange={vi.fn()} filtered={commands} recentIds={[]} />)
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('calls onClose when overlay is clicked', () => {
      const onClose = vi.fn()
      render(<CommandPalette isOpen={true} commands={commands} onClose={onClose} onExecute={vi.fn()} query="" onQueryChange={vi.fn()} filtered={commands} recentIds={[]} />)
      fireEvent.click(screen.getByTestId('palette-overlay'))
      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  describe('search', () => {
    it('renders search input', () => {
      render(<CommandPalette isOpen={true} commands={commands} onClose={vi.fn()} onExecute={vi.fn()} query="" onQueryChange={vi.fn()} filtered={commands} recentIds={[]} />)
      expect(screen.getByRole('searchbox')).toBeDefined()
    })

    it('calls onQueryChange when typing', () => {
      const onQueryChange = vi.fn()
      render(<CommandPalette isOpen={true} commands={commands} onClose={vi.fn()} onExecute={vi.fn()} query="" onQueryChange={onQueryChange} filtered={commands} recentIds={[]} />)
      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'note' } })
      expect(onQueryChange).toHaveBeenCalledWith('note')
    })

    it('renders only filtered commands', () => {
      const filtered = commands.filter((c) => c.label.includes('Note'))
      render(<CommandPalette isOpen={true} commands={commands} onClose={vi.fn()} onExecute={vi.fn()} query="note" onQueryChange={vi.fn()} filtered={filtered} recentIds={[]} />)
      expect(screen.getByText('New Note')).toBeDefined()
      expect(screen.getByText('Search Notes')).toBeDefined()
      expect(screen.queryByText('Open Settings')).toBeNull()
    })
  })

  describe('category grouping', () => {
    it('renders category headings', () => {
      render(<CommandPalette isOpen={true} commands={commands} onClose={vi.fn()} onExecute={vi.fn()} query="" onQueryChange={vi.fn()} filtered={commands} recentIds={[]} />)
      expect(screen.getByText('Notes')).toBeDefined()
      expect(screen.getByText('App')).toBeDefined()
    })
  })

  describe('keyboard navigation', () => {
    it('moves selection down with ArrowDown', () => {
      render(<CommandPalette isOpen={true} commands={commands} onClose={vi.fn()} onExecute={vi.fn()} query="" onQueryChange={vi.fn()} filtered={commands} recentIds={[]} />)
      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { key: 'ArrowDown' })
      const items = screen.getAllByRole('option')
      expect(items[0].getAttribute('aria-selected')).toBe('true')
    })

    it('moves selection up with ArrowUp', () => {
      render(<CommandPalette isOpen={true} commands={commands} onClose={vi.fn()} onExecute={vi.fn()} query="" onQueryChange={vi.fn()} filtered={commands} recentIds={[]} />)
      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { key: 'ArrowDown' })
      fireEvent.keyDown(dialog, { key: 'ArrowDown' })
      fireEvent.keyDown(dialog, { key: 'ArrowUp' })
      const items = screen.getAllByRole('option')
      expect(items[0].getAttribute('aria-selected')).toBe('true')
    })

    it('calls onExecute with the selected command on Enter', () => {
      const onExecute = vi.fn()
      render(<CommandPalette isOpen={true} commands={commands} onClose={vi.fn()} onExecute={onExecute} query="" onQueryChange={vi.fn()} filtered={commands} recentIds={[]} />)
      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { key: 'ArrowDown' })
      fireEvent.keyDown(dialog, { key: 'Enter' })
      expect(onExecute).toHaveBeenCalledWith(commands[0])
    })
  })

  describe('recent commands', () => {
    it('shows recent section when recentIds are present', () => {
      render(<CommandPalette isOpen={true} commands={commands} onClose={vi.fn()} onExecute={vi.fn()} query="" onQueryChange={vi.fn()} filtered={commands} recentIds={['new-note']} />)
      expect(screen.getByText('Recent')).toBeDefined()
    })

    it('does not show recent section when recentIds are empty', () => {
      render(<CommandPalette isOpen={true} commands={commands} onClose={vi.fn()} onExecute={vi.fn()} query="" onQueryChange={vi.fn()} filtered={commands} recentIds={[]} />)
      expect(screen.queryByText('Recent')).toBeNull()
    })

    it('lists recent commands by id lookup', () => {
      render(<CommandPalette isOpen={true} commands={commands} onClose={vi.fn()} onExecute={vi.fn()} query="" onQueryChange={vi.fn()} filtered={commands} recentIds={['open-settings']} />)
      const recentItems = screen.getAllByText('Open Settings')
      expect(recentItems.length).toBeGreaterThanOrEqual(1)
    })
  })
})
