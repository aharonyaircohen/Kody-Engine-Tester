import { describe, it, expect } from 'vitest'
import { UndoRedoManager } from './undo-redo'

describe('UndoRedoManager', () => {
  it('starts with empty history', () => {
    const mgr = new UndoRedoManager<number>()
    expect(mgr.canUndo).toBe(false)
    expect(mgr.canRedo).toBe(false)
  })

  it('push adds state and disables redo', () => {
    const mgr = new UndoRedoManager<number>()
    mgr.push(1)
    expect(mgr.canUndo).toBe(false)
    expect(mgr.canRedo).toBe(false)
  })

  it('canUndo is true after two pushes', () => {
    const mgr = new UndoRedoManager<number>()
    mgr.push(1)
    mgr.push(2)
    expect(mgr.canUndo).toBe(true)
  })

  it('undo returns previous state', () => {
    const mgr = new UndoRedoManager<number>()
    mgr.push(1)
    mgr.push(2)
    expect(mgr.undo()).toBe(1)
  })

  it('undo returns null when at beginning', () => {
    const mgr = new UndoRedoManager<number>()
    mgr.push(1)
    expect(mgr.undo()).toBeNull()
  })

  it('redo returns next state after undo', () => {
    const mgr = new UndoRedoManager<number>()
    mgr.push(1)
    mgr.push(2)
    mgr.undo()
    expect(mgr.redo()).toBe(2)
  })

  it('redo returns null when nothing to redo', () => {
    const mgr = new UndoRedoManager<number>()
    mgr.push(1)
    expect(mgr.redo()).toBeNull()
  })

  it('canRedo is true after undo', () => {
    const mgr = new UndoRedoManager<number>()
    mgr.push(1)
    mgr.push(2)
    mgr.undo()
    expect(mgr.canRedo).toBe(true)
  })

  it('canRedo is false after redo exhausted', () => {
    const mgr = new UndoRedoManager<number>()
    mgr.push(1)
    mgr.push(2)
    mgr.undo()
    mgr.redo()
    expect(mgr.canRedo).toBe(false)
  })

  it('pushing after undo clears redo stack', () => {
    const mgr = new UndoRedoManager<number>()
    mgr.push(1)
    mgr.push(2)
    mgr.undo()
    mgr.push(3)
    expect(mgr.canRedo).toBe(false)
    expect(mgr.undo()).toBe(1)
  })

  it('clear resets all history', () => {
    const mgr = new UndoRedoManager<number>()
    mgr.push(1)
    mgr.push(2)
    mgr.clear()
    expect(mgr.canUndo).toBe(false)
    expect(mgr.canRedo).toBe(false)
    expect(mgr.undo()).toBeNull()
    expect(mgr.redo()).toBeNull()
  })

  it('respects max history limit', () => {
    const mgr = new UndoRedoManager<number>(3)
    mgr.push(1)
    mgr.push(2)
    mgr.push(3)
    mgr.push(4)
    // history is [2, 3, 4] — oldest (1) was dropped
    expect(mgr.undo()).toBe(3)
    expect(mgr.undo()).toBe(2)
    // only 3 entries fit, so no more undo
    expect(mgr.canUndo).toBe(false)
  })

  it('supports multiple undo/redo cycles', () => {
    const mgr = new UndoRedoManager<string>()
    mgr.push('a')
    mgr.push('b')
    mgr.push('c')
    expect(mgr.undo()).toBe('b')
    expect(mgr.undo()).toBe('a')
    expect(mgr.redo()).toBe('b')
    expect(mgr.redo()).toBe('c')
    expect(mgr.canRedo).toBe(false)
  })

  it('works with object states', () => {
    const mgr = new UndoRedoManager<{ x: number }>()
    const s1 = { x: 1 }
    const s2 = { x: 2 }
    mgr.push(s1)
    mgr.push(s2)
    expect(mgr.undo()).toBe(s1)
  })
})
