import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventBus } from './event-bus'

describe('EventBus', () => {
  let eventBus: EventBus

  beforeEach(() => {
    eventBus = new EventBus()
  })

  describe('basic on/off/emit', () => {
    it('should call handler on emit', () => {
      const handler = vi.fn()
      eventBus.on('test', handler)
      eventBus.emit('test')
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should pass data to handler', () => {
      const handler = vi.fn()
      eventBus.on('test', handler)
      eventBus.emit('test', { message: 'hello' })
      expect(handler).toHaveBeenCalledWith({ message: 'hello' })
    })

    it('should call multiple handlers', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      eventBus.on('test', handler1)
      eventBus.on('test', handler2)
      eventBus.emit('test')
      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('should remove handler with off', () => {
      const handler = vi.fn()
      eventBus.on('test', handler)
      eventBus.off('test', handler)
      eventBus.emit('test')
      expect(handler).not.toHaveBeenCalled()
    })

    it('should not throw when off is called for non-existent handler', () => {
      const handler = vi.fn()
      expect(() => eventBus.off('test', handler)).not.toThrow()
    })
  })

  describe('once', () => {
    it('should call handler only once', () => {
      const handler = vi.fn()
      eventBus.once('test', handler)
      eventBus.emit('test')
      eventBus.emit('test')
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should pass data to once handler', () => {
      const handler = vi.fn()
      eventBus.once('test', handler)
      eventBus.emit('test', { value: 42 })
      expect(handler).toHaveBeenCalledWith({ value: 42 })
    })
  })

  describe('wildcard listeners', () => {
    it('should catch matching wildcard events', () => {
      const handler = vi.fn()
      eventBus.on('user:*', handler)
      eventBus.emit('user:created', { id: 1 })
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ id: 1 })
    })

    it('should catch multiple matching events', () => {
      const handler = vi.fn()
      eventBus.on('user:*', handler)
      eventBus.emit('user:created', { id: 1 })
      eventBus.emit('user:updated', { id: 1 })
      eventBus.emit('user:deleted', { id: 1 })
      expect(handler).toHaveBeenCalledTimes(3)
    })

    it('should not catch non-matching events', () => {
      const handler = vi.fn()
      eventBus.on('user:*', handler)
      eventBus.emit('post:created', { id: 1 })
      expect(handler).not.toHaveBeenCalled()
    })

    it('should work with once wildcard', () => {
      const handler = vi.fn()
      eventBus.once('user:*', handler)
      eventBus.emit('user:created', { id: 1 })
      eventBus.emit('user:updated', { id: 1 })
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('max listener warning', () => {
    it('should warn when exceeding max listeners', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const bus = new EventBus({ maxListeners: 2 })

      bus.on('test', vi.fn())
      bus.on('test', vi.fn())
      bus.on('test', vi.fn())

      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('Max listeners (2) exceeded for event "test"'),
      )
      warn.mockRestore()
    })

    it('should not warn when at max listeners', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const bus = new EventBus({ maxListeners: 2 })

      bus.on('test', vi.fn())
      bus.on('test', vi.fn())

      expect(warn).not.toHaveBeenCalled()
      warn.mockRestore()
    })
  })

  describe('error handling', () => {
    it('should emit error event when handler throws', () => {
      const errorHandler = vi.fn()
      const failingHandler = vi.fn(() => {
        throw new Error('Handler failed')
      })

      eventBus.on('error', errorHandler)
      eventBus.on('test', failingHandler)
      eventBus.emit('test')

      expect(errorHandler).toHaveBeenCalledTimes(1)
      const errorArg = errorHandler.mock.calls[0][0]
      expect(errorArg.error).toBeInstanceOf(Error)
      expect(errorArg.error.message).toBe('Handler failed')
      expect(errorArg.event).toBe('test')
    })

    it('should still call other handlers when one throws', () => {
      const errorHandler = vi.fn()
      const failingHandler = vi.fn(() => {
        throw new Error('Handler failed')
      })
      const successHandler = vi.fn()

      eventBus.on('error', errorHandler)
      eventBus.on('test', failingHandler)
      eventBus.on('test', successHandler)
      eventBus.emit('test')

      expect(successHandler).toHaveBeenCalledTimes(1)
      expect(errorHandler).toHaveBeenCalledTimes(1)
    })

    it('should throw if no error handler registered and handler throws', () => {
      const failingHandler = vi.fn(() => {
        throw new Error('Handler failed')
      })

      eventBus.on('test', failingHandler)
      expect(() => eventBus.emit('test')).toThrow('Handler failed')
    })
  })

  describe('typed events', () => {
    it('should work with generic event types', () => {
      type Events = {
        'user:created': { id: number; name: string }
        'user:updated': { id: number; changes: string[] }
        order: { orderId: string; total: number }
        [key: string]: unknown
      }

      const bus = new EventBus<Events>()

      const userHandler = vi.fn()
      const orderHandler = vi.fn()

      bus.on('user:created', userHandler)
      bus.on('order', orderHandler)

      bus.emit('user:created', { id: 1, name: 'Alice' })
      bus.emit('order', { orderId: '123', total: 99.99 })

      expect(userHandler).toHaveBeenCalledWith({ id: 1, name: 'Alice' })
      expect(orderHandler).toHaveBeenCalledWith({ orderId: '123', total: 99.99 })
    })

    it('should return event bus for chaining', () => {
      const handler = vi.fn()
      const result = eventBus.on('test', handler)
      expect(result).toBe(eventBus)
    })

    it('should return event bus from once for chaining', () => {
      const handler = vi.fn()
      const result = eventBus.once('test', handler)
      expect(result).toBe(eventBus)
    })
  })

  describe('listener count', () => {
    it('should return correct listener count', () => {
      expect(eventBus.listenerCount('test')).toBe(0)
      eventBus.on('test', vi.fn())
      expect(eventBus.listenerCount('test')).toBe(1)
      eventBus.on('test', vi.fn())
      expect(eventBus.listenerCount('test')).toBe(2)
      eventBus.off('test', eventBus.listeners('test')[0])
      expect(eventBus.listenerCount('test')).toBe(1)
    })

    it('should return listeners array', () => {
      const h1 = vi.fn()
      const h2 = vi.fn()
      eventBus.on('test', h1)
      eventBus.on('test', h2)
      const listeners = eventBus.listeners('test')
      expect(listeners).toHaveLength(2)
    })
  })

  describe('removeAllListeners', () => {
    it('should remove all listeners for an event', () => {
      eventBus.on('test', vi.fn())
      eventBus.on('test', vi.fn())
      eventBus.on('other', vi.fn())
      eventBus.removeAllListeners('test')
      expect(eventBus.listenerCount('test')).toBe(0)
      expect(eventBus.listenerCount('other')).toBe(1)
    })

    it('should remove all listeners for all events when called without args', () => {
      eventBus.on('test', vi.fn())
      eventBus.on('other', vi.fn())
      eventBus.removeAllListeners()
      expect(eventBus.listenerCount('test')).toBe(0)
      expect(eventBus.listenerCount('other')).toBe(0)
    })
  })
})
