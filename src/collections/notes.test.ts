import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NotesStore } from './notes'

describe('NotesStore', () => {
  let store: NotesStore

  beforeEach(() => {
    store = new NotesStore()
  })

  describe('create', () => {
    it('should create a note with all fields', () => {
      const note = store.create({ title: 'Test', content: 'Body', tags: ['a', 'b'] })
      expect(note.id).toBeDefined()
      expect(note.title).toBe('Test')
      expect(note.content).toBe('Body')
      expect(note.tags).toEqual(['a', 'b'])
      expect(note.createdAt).toBeInstanceOf(Date)
      expect(note.updatedAt).toBeInstanceOf(Date)
    })

    it('should default tags to empty array', () => {
      const note = store.create({ title: 'Test', content: 'Body' })
      expect(note.tags).toEqual([])
    })
  })

  describe('getAll', () => {
    it('should return all notes sorted by updatedAt desc', async () => {
      const note1 = store.create({ title: 'First', content: 'A' })
      // Ensure different timestamps
      await new Promise((r) => setTimeout(r, 10))
      const note2 = store.create({ title: 'Second', content: 'B' })

      const all = store.getAll()
      expect(all).toHaveLength(2)
      expect(all[0].id).toBe(note2.id)
      expect(all[1].id).toBe(note1.id)
    })

    it('should return empty array when no notes exist', () => {
      expect(store.getAll()).toEqual([])
    })
  })

  describe('getById', () => {
    it('should return a note by id', () => {
      const created = store.create({ title: 'Test', content: 'Body' })
      const found = store.getById(created.id)
      expect(found).toEqual(created)
    })

    it('should return null for non-existent id', () => {
      expect(store.getById('non-existent')).toBeNull()
    })
  })

  describe('update', () => {
    it('should update partial fields', () => {
      const note = store.create({ title: 'Old', content: 'Body', tags: ['x'] })
      const updated = store.update(note.id, { title: 'New' })
      expect(updated.title).toBe('New')
      expect(updated.content).toBe('Body')
      expect(updated.tags).toEqual(['x'])
    })

    it('should set new updatedAt', async () => {
      const note = store.create({ title: 'Test', content: 'Body' })
      await new Promise((r) => setTimeout(r, 10))
      const updated = store.update(note.id, { content: 'Updated' })
      expect(updated.updatedAt.getTime()).toBeGreaterThan(note.updatedAt.getTime())
    })

    it('should throw for non-existent id', () => {
      expect(() => store.update('missing', { title: 'X' })).toThrow('Note with id "missing" not found')
    })
  })

  describe('delete', () => {
    it('should delete an existing note and return true', () => {
      const note = store.create({ title: 'Test', content: 'Body' })
      expect(store.delete(note.id)).toBe(true)
      expect(store.getById(note.id)).toBeNull()
    })

    it('should return false for non-existent id', () => {
      expect(store.delete('missing')).toBe(false)
    })
  })

  describe('search', () => {
    beforeEach(() => {
      store.create({ title: 'Shopping List', content: 'Buy milk and eggs' })
      store.create({ title: 'Meeting Notes', content: 'Discuss project timeline' })
      store.create({ title: 'Recipe', content: 'Chocolate milk shake' })
    })

    it('should search by title', () => {
      const results = store.search('recipe')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Recipe')
    })

    it('should search by content', () => {
      const results = store.search('timeline')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Meeting Notes')
    })

    it('should be case-insensitive', () => {
      const results = store.search('SHOPPING')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Shopping List')
    })

    it('should match across title and content', () => {
      const results = store.search('milk')
      expect(results).toHaveLength(2)
    })

    it('should return empty for no match', () => {
      expect(store.search('nonexistent')).toEqual([])
    })
  })
})
