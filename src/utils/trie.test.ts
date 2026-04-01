import { describe, it, expect } from 'vitest'
import { Trie } from './trie'

describe('Trie', () => {
  describe('insert', () => {
    it('inserts a word into the trie', () => {
      const trie = new Trie()
      trie.insert('hello')
      expect(trie.search('hello')).toBe(true)
    })

    it('inserts multiple words', () => {
      const trie = new Trie()
      trie.insert('hello')
      trie.insert('world')
      expect(trie.search('hello')).toBe(true)
      expect(trie.search('world')).toBe(true)
    })

    it('inserts words with common prefix', () => {
      const trie = new Trie()
      trie.insert('apple')
      trie.insert('app')
      expect(trie.search('apple')).toBe(true)
      expect(trie.search('app')).toBe(true)
    })
  })

  describe('search', () => {
    it('returns true for existing word', () => {
      const trie = new Trie()
      trie.insert('hello')
      expect(trie.search('hello')).toBe(true)
    })

    it('returns false for non-existing word', () => {
      const trie = new Trie()
      trie.insert('hello')
      expect(trie.search('world')).toBe(false)
    })

    it('returns false for partial word', () => {
      const trie = new Trie()
      trie.insert('hello')
      expect(trie.search('hell')).toBe(false)
    })

    it('returns true for exact word when multiple similar words exist', () => {
      const trie = new Trie()
      trie.insert('test')
      trie.insert('testing')
      expect(trie.search('test')).toBe(true)
      expect(trie.search('testing')).toBe(true)
    })

    it('returns false for empty string search', () => {
      const trie = new Trie()
      trie.insert('hello')
      expect(trie.search('')).toBe(false)
    })
  })

  describe('startsWith', () => {
    it('returns true for existing prefix', () => {
      const trie = new Trie()
      trie.insert('hello')
      expect(trie.startsWith('hel')).toBe(true)
    })

    it('returns true when prefix is complete word', () => {
      const trie = new Trie()
      trie.insert('hello')
      expect(trie.startsWith('hello')).toBe(true)
    })

    it('returns false for non-existing prefix', () => {
      const trie = new Trie()
      trie.insert('hello')
      expect(trie.startsWith('world')).toBe(false)
    })

    it('returns true for empty prefix', () => {
      const trie = new Trie()
      trie.insert('hello')
      expect(trie.startsWith('')).toBe(true)
    })

    it('returns true for prefix of any word', () => {
      const trie = new Trie()
      trie.insert('apple')
      trie.insert('app')
      expect(trie.startsWith('ap')).toBe(true)
      expect(trie.startsWith('app')).toBe(true)
      expect(trie.startsWith('appl')).toBe(true)
    })
  })
})