import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createBus } from './message-bus'

type TestMessages = {
  greet: { name: string }
  count: number
  toggle: boolean
}

describe('createBus', () => {
  let bus: ReturnType<typeof createBus<TestMessages>>

  beforeEach(() => {
    bus = createBus<TestMessages>()
  })

  describe('publish / subscribe', () => {
    it('calls subscriber with published payload', () => {
      const handler = vi.fn()
      bus.subscribe('greet', handler)
      bus.publish('greet', { name: 'Alice' })
      expect(handler).toHaveBeenCalledOnce()
      expect(handler).toHaveBeenCalledWith({ name: 'Alice' })
    })

    it('calls multiple subscribers on the same channel', () => {
      const h1 = vi.fn()
      const h2 = vi.fn()
      bus.subscribe('greet', h1)
      bus.subscribe('greet', h2)
      bus.publish('greet', { name: 'Bob' })
      expect(h1).toHaveBeenCalledOnce()
      expect(h2).toHaveBeenCalledOnce()
    })

    it('does not call subscribers on other channels', () => {
      const handler = vi.fn()
      bus.subscribe('greet', handler)
      bus.publish('count', 42)
      expect(handler).not.toHaveBeenCalled()
    })

    it('calls subscriber multiple times for multiple publishes', () => {
      const handler = vi.fn()
      bus.subscribe('count', handler)
      bus.publish('count', 1)
      bus.publish('count', 2)
      bus.publish('count', 3)
      expect(handler).toHaveBeenCalledTimes(3)
    })
  })

  describe('unsubscribe', () => {
    it('stops calling handler after unsubscribe', () => {
      const handler = vi.fn()
      const unsubscribe = bus.subscribe('greet', handler)
      bus.publish('greet', { name: 'Alice' })
      unsubscribe()
      bus.publish('greet', { name: 'Bob' })
      expect(handler).toHaveBeenCalledOnce()
    })

    it('unsubscribing is idempotent', () => {
      const handler = vi.fn()
      const unsubscribe = bus.subscribe('count', handler)
      unsubscribe()
      expect(() => unsubscribe()).not.toThrow()
    })

    it('only removes the specific subscriber', () => {
      const h1 = vi.fn()
      const h2 = vi.fn()
      const unsub1 = bus.subscribe('greet', h1)
      bus.subscribe('greet', h2)
      unsub1()
      bus.publish('greet', { name: 'Charlie' })
      expect(h1).not.toHaveBeenCalled()
      expect(h2).toHaveBeenCalledOnce()
    })
  })

  describe('subscribeOnce', () => {
    it('calls handler only once and then auto-unsubscribes', () => {
      const handler = vi.fn()
      bus.subscribeOnce('count', handler)
      bus.publish('count', 1)
      bus.publish('count', 2)
      expect(handler).toHaveBeenCalledOnce()
      expect(handler).toHaveBeenCalledWith(1)
    })

    it('returns unsubscribe that cancels before first call', () => {
      const handler = vi.fn()
      const unsubscribe = bus.subscribeOnce('count', handler)
      unsubscribe()
      bus.publish('count', 99)
      expect(handler).not.toHaveBeenCalled()
    })

    it('does not affect regular subscribers on same channel', () => {
      const once = vi.fn()
      const always = vi.fn()
      bus.subscribeOnce('toggle', once)
      bus.subscribe('toggle', always)
      bus.publish('toggle', true)
      bus.publish('toggle', false)
      expect(once).toHaveBeenCalledOnce()
      expect(always).toHaveBeenCalledTimes(2)
    })
  })

  describe('history', () => {
    it('returns all published payloads in order', () => {
      bus.publish('count', 1)
      bus.publish('count', 2)
      bus.publish('count', 3)
      expect(bus.history('count')).toEqual([1, 2, 3])
    })

    it('returns empty array when no messages published', () => {
      expect(bus.history('greet')).toEqual([])
    })

    it('returns last N messages when limit is provided', () => {
      bus.publish('count', 10)
      bus.publish('count', 20)
      bus.publish('count', 30)
      bus.publish('count', 40)
      expect(bus.history('count', 2)).toEqual([30, 40])
    })

    it('returns all messages when limit exceeds history length', () => {
      bus.publish('count', 5)
      bus.publish('count', 6)
      expect(bus.history('count', 100)).toEqual([5, 6])
    })

    it('returns independent history per channel', () => {
      bus.publish('count', 1)
      bus.publish('toggle', true)
      bus.publish('count', 2)
      expect(bus.history('count')).toEqual([1, 2])
      expect(bus.history('toggle')).toEqual([true])
    })

    it('does not mutate internal history when result is modified', () => {
      bus.publish('count', 7)
      const h = bus.history('count')
      h.push(999 as never)
      expect(bus.history('count')).toEqual([7])
    })
  })

  describe('clear', () => {
    it('clears history for a specific channel', () => {
      bus.publish('count', 1)
      bus.publish('greet', { name: 'Dan' })
      bus.clear('count')
      expect(bus.history('count')).toEqual([])
      expect(bus.history('greet')).toEqual([{ name: 'Dan' }])
    })

    it('clears all channel histories when called without argument', () => {
      bus.publish('count', 1)
      bus.publish('toggle', false)
      bus.clear()
      expect(bus.history('count')).toEqual([])
      expect(bus.history('toggle')).toEqual([])
    })

    it('does not remove active subscribers', () => {
      const handler = vi.fn()
      bus.subscribe('count', handler)
      bus.publish('count', 1)
      bus.clear('count')
      bus.publish('count', 2)
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('history accumulates again after clear', () => {
      bus.publish('count', 1)
      bus.clear('count')
      bus.publish('count', 2)
      expect(bus.history('count')).toEqual([2])
    })
  })

  describe('type safety', () => {
    it('buses are independent instances', () => {
      type A = { ping: string }
      type B = { ping: number }
      const busA = createBus<A>()
      const busB = createBus<B>()
      const hA = vi.fn()
      const hB = vi.fn()
      busA.subscribe('ping', hA)
      busB.subscribe('ping', hB)
      busA.publish('ping', 'hello')
      busB.publish('ping', 42)
      expect(hA).toHaveBeenCalledWith('hello')
      expect(hB).toHaveBeenCalledWith(42)
    })
  })
})
