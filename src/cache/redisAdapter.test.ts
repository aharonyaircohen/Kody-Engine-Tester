import { describe, it, expect } from 'vitest'
import { RedisAdapter } from './redisAdapter'

describe('RedisAdapter', () => {
  describe('constructor', () => {
    it('creates adapter with connection config object', () => {
      const adapter = new RedisAdapter({
        host: 'redis.example.com',
        port: 6380,
        password: 'secret',
      })

      expect(adapter).toBeInstanceOf(RedisAdapter)
    })

    it('creates adapter with single string host', () => {
      const adapter = new RedisAdapter('redis.example.com')

      expect(adapter).toBeInstanceOf(RedisAdapter)
    })

    it('creates adapter with default config', () => {
      const adapter = new RedisAdapter({})

      expect(adapter).toBeInstanceOf(RedisAdapter)
    })
  })

  // Note: Full integration tests with Redis would require a running Redis instance.
  // These tests verify the adapter compiles and initializes correctly.
})