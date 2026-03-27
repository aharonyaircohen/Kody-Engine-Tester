import { describe, it, expect } from 'vitest'
import { DependencyGraph } from './dep-graph'

describe('DependencyGraph', () => {
  describe('addNode / addDependency', () => {
    it('adds nodes and retrieves them via sort', () => {
      const g = new DependencyGraph()
      g.addNode('a')
      g.addNode('b')
      const sorted = g.sort()
      expect(sorted).toContain('a')
      expect(sorted).toContain('b')
    })

    it('auto-creates nodes when adding a dependency', () => {
      const g = new DependencyGraph()
      g.addDependency('a', 'b')
      expect(g.sort()).toContain('b')
    })
  })

  describe('sort (topological)', () => {
    it('linear chain: a -> b -> c', () => {
      const g = new DependencyGraph()
      g.addDependency('a', 'b')
      g.addDependency('b', 'c')
      const sorted = g.sort()
      expect(sorted.indexOf('c')).toBeLessThan(sorted.indexOf('b'))
      expect(sorted.indexOf('b')).toBeLessThan(sorted.indexOf('a'))
    })

    it('diamond: a -> b, a -> c, b -> d, c -> d', () => {
      const g = new DependencyGraph()
      g.addDependency('a', 'b')
      g.addDependency('a', 'c')
      g.addDependency('b', 'd')
      g.addDependency('c', 'd')
      const sorted = g.sort()
      expect(sorted.indexOf('d')).toBeLessThan(sorted.indexOf('b'))
      expect(sorted.indexOf('d')).toBeLessThan(sorted.indexOf('c'))
      expect(sorted.indexOf('b')).toBeLessThan(sorted.indexOf('a'))
      expect(sorted.indexOf('c')).toBeLessThan(sorted.indexOf('a'))
    })

    it('single node with no edges', () => {
      const g = new DependencyGraph()
      g.addNode('a')
      expect(g.sort()).toEqual(['a'])
    })

    it('throws on circular dependency', () => {
      const g = new DependencyGraph()
      g.addDependency('a', 'b')
      g.addDependency('b', 'a')
      expect(() => g.sort()).toThrow(/circular/i)
    })

    it('throws on self-referencing node', () => {
      const g = new DependencyGraph()
      g.addDependency('a', 'a')
      expect(() => g.sort()).toThrow(/circular/i)
    })
  })

  describe('dependenciesOf', () => {
    it('returns direct dependency', () => {
      const g = new DependencyGraph()
      g.addDependency('a', 'b')
      expect(g.dependenciesOf('a')).toContain('b')
    })

    it('returns transitive dependencies', () => {
      const g = new DependencyGraph()
      g.addDependency('a', 'b')
      g.addDependency('b', 'c')
      const deps = g.dependenciesOf('a')
      expect(deps).toContain('b')
      expect(deps).toContain('c')
    })

    it('diamond: dependenciesOf(a) includes b, c, d without duplicates', () => {
      const g = new DependencyGraph()
      g.addDependency('a', 'b')
      g.addDependency('a', 'c')
      g.addDependency('b', 'd')
      g.addDependency('c', 'd')
      const deps = g.dependenciesOf('a')
      expect(deps).toContain('b')
      expect(deps).toContain('c')
      expect(deps).toContain('d')
      expect(deps.filter((x) => x === 'd')).toHaveLength(1)
    })

    it('returns empty array for node with no dependencies', () => {
      const g = new DependencyGraph()
      g.addNode('a')
      expect(g.dependenciesOf('a')).toEqual([])
    })

    it('throws for unknown node', () => {
      const g = new DependencyGraph()
      expect(() => g.dependenciesOf('x')).toThrow(/not found/i)
    })
  })

  describe('dependantsOf', () => {
    it('returns direct dependant', () => {
      const g = new DependencyGraph()
      g.addDependency('a', 'b')
      expect(g.dependantsOf('b')).toContain('a')
    })

    it('returns transitive dependants', () => {
      const g = new DependencyGraph()
      g.addDependency('a', 'b')
      g.addDependency('b', 'c')
      const deps = g.dependantsOf('c')
      expect(deps).toContain('b')
      expect(deps).toContain('a')
    })

    it('diamond: dependantsOf(d) includes b, c, a without duplicates', () => {
      const g = new DependencyGraph()
      g.addDependency('a', 'b')
      g.addDependency('a', 'c')
      g.addDependency('b', 'd')
      g.addDependency('c', 'd')
      const deps = g.dependantsOf('d')
      expect(deps).toContain('b')
      expect(deps).toContain('c')
      expect(deps).toContain('a')
      expect(deps.filter((x) => x === 'a')).toHaveLength(1)
    })

    it('returns empty array for leaf node', () => {
      const g = new DependencyGraph()
      g.addDependency('a', 'b')
      expect(g.dependantsOf('a')).toEqual([])
    })

    it('throws for unknown node', () => {
      const g = new DependencyGraph()
      expect(() => g.dependantsOf('x')).toThrow(/not found/i)
    })
  })

  describe('hasCycle', () => {
    it('returns false for acyclic graph', () => {
      const g = new DependencyGraph()
      g.addDependency('a', 'b')
      g.addDependency('b', 'c')
      expect(g.hasCycle()).toBe(false)
    })

    it('returns true for direct cycle', () => {
      const g = new DependencyGraph()
      g.addDependency('a', 'b')
      g.addDependency('b', 'a')
      expect(g.hasCycle()).toBe(true)
    })

    it('returns true for longer cycle', () => {
      const g = new DependencyGraph()
      g.addDependency('a', 'b')
      g.addDependency('b', 'c')
      g.addDependency('c', 'a')
      expect(g.hasCycle()).toBe(true)
    })

    it('returns false for empty graph', () => {
      const g = new DependencyGraph()
      expect(g.hasCycle()).toBe(false)
    })
  })

  describe('complex graph', () => {
    it('handles multiple disconnected subgraphs', () => {
      const g = new DependencyGraph()
      g.addDependency('a', 'b')
      g.addDependency('x', 'y')
      const sorted = g.sort()
      expect(sorted.indexOf('b')).toBeLessThan(sorted.indexOf('a'))
      expect(sorted.indexOf('y')).toBeLessThan(sorted.indexOf('x'))
    })

    it('complex graph: correct sort order', () => {
      const g = new DependencyGraph()
      // e -> d -> b -> a
      //        -> c -> a
      g.addDependency('e', 'd')
      g.addDependency('d', 'b')
      g.addDependency('d', 'c')
      g.addDependency('b', 'a')
      g.addDependency('c', 'a')
      const sorted = g.sort()
      expect(sorted.indexOf('a')).toBeLessThan(sorted.indexOf('b'))
      expect(sorted.indexOf('a')).toBeLessThan(sorted.indexOf('c'))
      expect(sorted.indexOf('b')).toBeLessThan(sorted.indexOf('d'))
      expect(sorted.indexOf('c')).toBeLessThan(sorted.indexOf('d'))
      expect(sorted.indexOf('d')).toBeLessThan(sorted.indexOf('e'))
    })

    it('stores and preserves node data', () => {
      const g = new DependencyGraph<{ version: number }>()
      g.addNode('a', { version: 1 })
      g.addNode('b', { version: 2 })
      g.addDependency('a', 'b')
      expect(g.sort()).toEqual(['b', 'a'])
    })
  })
})
