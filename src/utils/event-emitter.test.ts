import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventEmitter } from './event-emitter'

describe('EventEmitter', () => {
  let emitter: EventEmitter

  beforeEach(() => {
    emitter = new EventEmitter()
  })

  describe('on', () => {
    it('should call handler when event is emitted', () => {
      const handler = vi.fn()
      emitter.on('test', handler)
      emitter.emit('test')
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should pass arguments to handler', () => {
      const handler = vi.fn()
      emitter.on('test', handler)
      emitter.emit('test', 'hello', 42)
      expect(handler).toHaveBeenCalledWith('hello', 42)
    })

    it('should call multiple handlers for same event', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      emitter.on('test', handler1)
      emitter.on('test', handler2)
      emitter.emit('test')
      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('should return this for chaining', () => {
      const result = emitter.on('test', vi.fn())
      expect(result).toBe(emitter)
    })

    it('should allow chaining multiple on calls', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      emitter.on('test1', handler1).on('test2', handler2)
      emitter.emit('test1')
      emitter.emit('test2')
      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(1)
    })
  })

  describe('off', () => {
    it('should remove handler from event', () => {
      const handler = vi.fn()
      emitter.on('test', handler)
      emitter.off('test', handler)
      emitter.emit('test')
      expect(handler).not.toHaveBeenCalled()
    })

    it('should only remove specific handler', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      emitter.on('test', handler1)
      emitter.on('test', handler2)
      emitter.off('test', handler1)
      emitter.emit('test')
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('should not throw when removing non-existent handler', () => {
      const handler = vi.fn()
      expect(() => emitter.off('test', handler)).not.toThrow()
    })

    it('should not throw when removing from non-existent event', () => {
      const handler = vi.fn()
      expect(() => emitter.off('nonexistent', handler)).not.toThrow()
    })

    it('should handle double-remove gracefully', () => {
      const handler = vi.fn()
      emitter.on('test', handler)
      emitter.off('test', handler)
      expect(() => emitter.off('test', handler)).not.toThrow()
    })

    it('should return this for chaining', () => {
      const handler = vi.fn()
      emitter.on('test', handler)
      const result = emitter.off('test', handler)
      expect(result).toBe(emitter)
    })
  })

  describe('once', () => {
    it('should call handler only once', () => {
      const handler = vi.fn()
      emitter.once('test', handler)
      emitter.emit('test')
      emitter.emit('test')
      emitter.emit('test')
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should pass arguments to once handler', () => {
      const handler = vi.fn()
      emitter.once('test', handler)
      emitter.emit('test', 'value')
      expect(handler).toHaveBeenCalledWith('value')
    })

    it('should work with multiple handlers', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      emitter.once('test', handler1)
      emitter.on('test', handler2)
      emitter.emit('test')
      emitter.emit('test')
      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(2)
    })

    it('should return this for chaining', () => {
      const result = emitter.once('test', vi.fn())
      expect(result).toBe(emitter)
    })

    it('should allow chaining once with on', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      emitter.once('test', handler1).on('test', handler2)
      emitter.emit('test')
      emitter.emit('test')
      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(2)
    })
  })

  describe('emit', () => {
    it('should not throw when emitting with no listeners', () => {
      expect(() => emitter.emit('test')).not.toThrow()
    })

    it('should call all handlers on emit', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()
      emitter.on('test', handler1)
      emitter.on('test', handler2)
      emitter.on('test', handler3)
      emitter.emit('test')
      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(1)
      expect(handler3).toHaveBeenCalledTimes(1)
    })

    it('should pass single argument', () => {
      const handler = vi.fn()
      emitter.on('test', handler)
      emitter.emit('test', 42)
      expect(handler).toHaveBeenCalledWith(42)
    })

    it('should pass multiple arguments', () => {
      const handler = vi.fn()
      emitter.on('test', handler)
      emitter.emit('test', 'a', 'b', 'c')
      expect(handler).toHaveBeenCalledWith('a', 'b', 'c')
    })

    it('should handle complex object arguments', () => {
      const handler = vi.fn()
      const obj = { id: 1, name: 'test', nested: { value: 42 } }
      emitter.on('test', handler)
      emitter.emit('test', obj)
      expect(handler).toHaveBeenCalledWith(obj)
    })

    it('should emit to specific event only', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      emitter.on('event1', handler1)
      emitter.on('event2', handler2)
      emitter.emit('event1')
      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).not.toHaveBeenCalled()
    })

    it('should handle null and undefined arguments', () => {
      const handler = vi.fn()
      emitter.on('test', handler)
      emitter.emit('test', null, undefined)
      expect(handler).toHaveBeenCalledWith(null, undefined)
    })
  })

  describe('removeAllListeners', () => {
    it('should remove all listeners for specific event', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      emitter.on('test', handler1)
      emitter.on('test', handler2)
      emitter.removeAllListeners('test')
      emitter.emit('test')
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })

    it('should only remove listeners for specified event', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      emitter.on('event1', handler1)
      emitter.on('event2', handler2)
      emitter.removeAllListeners('event1')
      emitter.emit('event1')
      emitter.emit('event2')
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('should remove all listeners when called without arguments', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()
      emitter.on('event1', handler1)
      emitter.on('event2', handler2)
      emitter.on('event3', handler3)
      emitter.removeAllListeners()
      emitter.emit('event1')
      emitter.emit('event2')
      emitter.emit('event3')
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
      expect(handler3).not.toHaveBeenCalled()
    })

    it('should not throw when removing all listeners for non-existent event', () => {
      expect(() => emitter.removeAllListeners('nonexistent')).not.toThrow()
    })

    it('should return this for chaining', () => {
      const result = emitter.removeAllListeners()
      expect(result).toBe(emitter)
    })

    it('should work with chaining', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      emitter.on('test1', handler1).on('test2', handler2).removeAllListeners()
      emitter.emit('test1')
      emitter.emit('test2')
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle handler that throws', () => {
      const failingHandler = vi.fn(() => {
        throw new Error('Handler error')
      })
      const successHandler = vi.fn()
      emitter.on('test', failingHandler)
      emitter.on('test', successHandler)
      expect(() => emitter.emit('test')).toThrow('Handler error')
      expect(successHandler).not.toHaveBeenCalled()
    })

    it('should handle removing handler during iteration', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()
      emitter.on('test', handler1)
      emitter.on('test', handler2)
      emitter.on('test', handler3)
      emitter.off('test', handler2)
      emitter.emit('test')
      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).not.toHaveBeenCalled()
      expect(handler3).toHaveBeenCalledTimes(1)
    })

    it('should handle re-adding handler after removal', () => {
      const handler = vi.fn()
      emitter.on('test', handler)
      emitter.emit('test')
      emitter.off('test', handler)
      emitter.on('test', handler)
      emitter.emit('test')
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('should handle same handler registered multiple times', () => {
      const handler = vi.fn()
      emitter.on('test', handler)
      emitter.on('test', handler)
      emitter.emit('test')
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should handle once and on for same handler', () => {
      const handler = vi.fn()
      emitter.on('test', handler)
      emitter.once('test', handler)
      emitter.emit('test')
      emitter.emit('test')
      expect(handler).toHaveBeenCalledTimes(3)
    })

    it('should handle empty event name', () => {
      const handler = vi.fn()
      emitter.on('' as never, handler)
      emitter.emit('' as never)
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('type safety', () => {
    it('should work with typed event map', () => {
      type MyEvents = {
        'user:login': [string, number]
        'user:logout': []
        'data:update': [{ id: string; value: number }]
      }

      const typedEmitter = new EventEmitter<MyEvents>()
      const loginHandler = vi.fn()
      const logoutHandler = vi.fn()
      const updateHandler = vi.fn()

      typedEmitter.on('user:login', loginHandler)
      typedEmitter.on('user:logout', logoutHandler)
      typedEmitter.on('data:update', updateHandler)

      typedEmitter.emit('user:login', 'alice', 42)
      typedEmitter.emit('user:logout')
      typedEmitter.emit('data:update', { id: '123', value: 100 })

      expect(loginHandler).toHaveBeenCalledWith('alice', 42)
      expect(logoutHandler).toHaveBeenCalledTimes(1)
      expect(updateHandler).toHaveBeenCalledWith({ id: '123', value: 100 })
    })

    it('should work with void events', () => {
      type MyEvents = {
        'event:start': void
        'event:stop': void
      }

      const typedEmitter = new EventEmitter<MyEvents>()
      const handler = vi.fn()
      typedEmitter.on('event:start', handler)
      typedEmitter.emit('event:start')
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should work with single argument event', () => {
      type MyEvents = {
        message: [string]
      }

      const typedEmitter = new EventEmitter<MyEvents>()
      const handler = vi.fn()
      typedEmitter.on('message', handler)
      typedEmitter.emit('message', 'hello')
      expect(handler).toHaveBeenCalledWith('hello')
    })

    it('should work with mixed event types', () => {
      type MyEvents = {
        'simple': []
        'single': [number]
        'multiple': [string, boolean, object]
      }

      const typedEmitter = new EventEmitter<MyEvents>()
      const h1 = vi.fn()
      const h2 = vi.fn()
      const h3 = vi.fn()

      typedEmitter.on('simple', h1)
      typedEmitter.on('single', h2)
      typedEmitter.on('multiple', h3)

      typedEmitter.emit('simple')
      typedEmitter.emit('single', 42)
      typedEmitter.emit('multiple', 'test', true, { key: 'value' })

      expect(h1).toHaveBeenCalledTimes(1)
      expect(h2).toHaveBeenCalledWith(42)
      expect(h3).toHaveBeenCalledWith('test', true, { key: 'value' })
    })
  })
})
