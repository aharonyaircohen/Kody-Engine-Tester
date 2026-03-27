'use client'

import { useState, useCallback } from 'react'

export interface Command {
  id: string
  label: string
  action: () => void
  shortcut?: string
  icon?: string
  category?: string
}

const STORAGE_KEY = 'command-palette-recent'
const MAX_RECENT = 5

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function writeRecent(ids: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function useCommandPalette(commands: Command[]) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [recentIds, setRecentIds] = useState<string[]>(() => readRecent())

  const open = useCallback(() => {
    setQuery('')
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
  }, [])

  const execute = useCallback((command: Command) => {
    command.action()
    setRecentIds((prev) => {
      const next = [command.id, ...prev.filter((id) => id !== command.id)].slice(0, MAX_RECENT)
      writeRecent(next)
      return next
    })
    setIsOpen(false)
    setQuery('')
  }, [])

  const filtered =
    query.trim() === ''
      ? commands
      : commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))

  return { isOpen, open, close, query, setQuery, filtered, recentIds, execute }
}
