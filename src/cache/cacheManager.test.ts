import { describe, it, expect, vi } from 'vitest'
import { CacheManager } from './cacheManager'

// Mock the adapters to avoid requiring actual Redis connection
vi.mock('./memoryAdapter')
vi.mock('./redisAdapter')

describe('CacheManager', () => {
  describe('constructor', () => {
    it('creates cache manager with memory adapter', () => {
      const manager = new CacheManager({ adapter: 'memory' })

      expect(manager).toBeInstanceOf(CacheManager)
    })

    it('creates cache manager with memory adapter and custom options', () => {
      const manager = new CacheManager({
        adapter: 'memory',
        maxSize: 100,
        defaultTTL: 60000,
      })

      expect(manager).toBeInstanceOf(CacheManager)
    })

    it('creates cache manager with redis adapter', () => {
      const manager = new CacheManager({
        adapter: 'redis',
        redisConfig: { host: 'localhost', port: 6379 },
      })

      expect(manager).toBeInstanceOf(CacheManager)
    })

    it('creates cache manager with redis adapter using default config', () => {
      const manager = new CacheManager({ adapter: 'redis' })

      expect(manager).toBeInstanceOf(CacheManager)
    })
  })

  describe('dispose', () => {
    it('disposes the container', () => {
      const manager = new CacheManager({ adapter: 'memory' })

      expect(() => manager.dispose()).not.toThrow()
    })
  })
})