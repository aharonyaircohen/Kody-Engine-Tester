'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Command } from '@/hooks/useCommandPalette'
import styles from './CommandPalette.module.css'

interface CommandPaletteProps {
  isOpen: boolean
  commands: Command[]
  onClose: () => void
  onExecute: (command: Command) => void
  query: string
  onQueryChange: (value: string) => void
  filtered: Command[]
  recentIds: string[]
}

function groupByCategory(commands: Command[]): Record<string, Command[]> {
  return commands.reduce<Record<string, Command[]>>((acc, cmd) => {
    const key = cmd.category ?? 'General'
    acc[key] = acc[key] ?? []
    acc[key].push(cmd)
    return acc
  }, {})
}

export function CommandPalette({
  isOpen,
  commands,
  onClose,
  onExecute,
  query,
  onQueryChange,
  filtered,
  recentIds,
}: CommandPaletteProps) {
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    // eslint-disable-next-line
    setActiveIndex(-1)
  }, [query, isOpen])

  const recentCommands = recentIds
    .map((id) => commands.find((c) => c.id === id))
    .filter((c): c is Command => c !== undefined)

  const groups = groupByCategory(filtered)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < filtered.length) {
        onExecute(filtered[activeIndex])
      }
    },
    [activeIndex, filtered, onClose, onExecute],
  )

  if (!isOpen) return null

  return (
    <div
      className={styles.overlay}
      data-testid="palette-overlay"
      onClick={onClose}
    >
      <div
        className={styles.palette}
        role="dialog"
        aria-label="Command palette"
        aria-modal="true"
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <input
          className={styles.search}
          role="searchbox"
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Type a command..."
          autoFocus
          aria-label="Search commands"
        />

        <div className={styles.results} role="listbox">
          {recentCommands.length > 0 && query === '' && (
            <div className={styles.group}>
              <div className={styles.groupLabel}>Recent</div>
              {recentCommands.map((cmd) => {
                const globalIdx = filtered.indexOf(cmd)
                return (
                  <button
                    key={`recent-${cmd.id}`}
                    className={`${styles.item} ${globalIdx === activeIndex ? styles.itemActive : ''}`}
                    role="option"
                    aria-selected={globalIdx === activeIndex}
                    onClick={() => onExecute(cmd)}
                  >
                    {cmd.icon && <span className={styles.icon}>{cmd.icon}</span>}
                    <span className={styles.label}>{cmd.label}</span>
                    {cmd.shortcut && <kbd className={styles.shortcut}>{cmd.shortcut}</kbd>}
                  </button>
                )
              })}
            </div>
          )}

          {Object.entries(groups).map(([category, cmds]) => (
            <div key={category} className={styles.group}>
              <div className={styles.groupLabel}>{category}</div>
              {cmds.map((cmd) => {
                const globalIdx = filtered.indexOf(cmd)
                return (
                  <button
                    key={cmd.id}
                    className={`${styles.item} ${globalIdx === activeIndex ? styles.itemActive : ''}`}
                    role="option"
                    aria-selected={globalIdx === activeIndex}
                    onClick={() => onExecute(cmd)}
                  >
                    {cmd.icon && <span className={styles.icon}>{cmd.icon}</span>}
                    <span className={styles.label}>{cmd.label}</span>
                    {cmd.shortcut && <kbd className={styles.shortcut}>{cmd.shortcut}</kbd>}
                  </button>
                )
              })}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className={styles.empty}>No commands found</div>
          )}
        </div>
      </div>
    </div>
  )
}
