import { useState, useCallback } from 'react'

export class UndoRedoManager<T> {
  private past: T[] = []
  private future: T[] = []
  private maxHistory: number

  constructor(maxHistory = 50) {
    this.maxHistory = maxHistory
  }

  get canUndo(): boolean {
    return this.past.length > 1
  }

  get canRedo(): boolean {
    return this.future.length > 0
  }

  push(state: T): void {
    this.past.push(state)
    if (this.past.length > this.maxHistory) {
      this.past.shift()
    }
    this.future = []
  }

  undo(): T | null {
    if (!this.canUndo) return null
    const current = this.past.pop()!
    this.future.unshift(current)
    return this.past[this.past.length - 1]
  }

  redo(): T | null {
    if (!this.canRedo) return null
    const next = this.future.shift()!
    this.past.push(next)
    return next
  }

  clear(): void {
    this.past = []
    this.future = []
  }
}

export function useUndoRedo<T>(initialState: T): [T, (state: T) => void, () => void, () => void, boolean, boolean] {
  const [manager] = useState(() => {
    const m = new UndoRedoManager<T>()
    m.push(initialState)
    return m
  })
  const [state, setStateInternal] = useState<T>(initialState)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const sync = useCallback((newState: T) => {
    setStateInternal(newState)
    setCanUndo(manager.canUndo)
    setCanRedo(manager.canRedo)
  }, [manager])

  const setState = useCallback((newState: T) => {
    manager.push(newState)
    sync(newState)
  }, [manager, sync])

  const undo = useCallback(() => {
    const prev = manager.undo()
    if (prev !== null) sync(prev)
  }, [manager, sync])

  const redo = useCallback(() => {
    const next = manager.redo()
    if (next !== null) sync(next)
  }, [manager, sync])

  return [state, setState, undo, redo, canUndo, canRedo]
}
