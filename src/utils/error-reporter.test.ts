import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ErrorReporter, consoleTransport, memoryTransport } from './error-reporter'

describe('ErrorReporter', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    // Clear singleton memory store between tests
    new ErrorReporter([]).reset()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('consoleTransport', () => {
    it('logs error message and stack trace to console.error', () => {
      const error = new Error('Something went wrong')
      consoleTransport({ error, context: { url: '/test' }, timestamp: new Date() })
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      const logged = consoleErrorSpy.mock.calls[0][0] as string
      expect(logged).toContain('Something went wrong')
      expect(logged).toContain(error.stack)
    })

    it('includes context in the logged output', () => {
      const error = new Error('DB failure')
      consoleTransport({ error, context: { url: '/api', userId: '123' }, timestamp: new Date() })
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      const logged = consoleErrorSpy.mock.calls[0][0] as string
      expect(logged).toContain('DB failure')
      expect(logged).toContain('/api')
      expect(logged).toContain('123')
    })
  })

  describe('memoryTransport', () => {
    it('stores errors in memory', () => {
      const store: Array<{ error: Error; context?: Record<string, unknown>; timestamp: Date }> = []
      const transport = memoryTransport(50, store)
      const error = new Error('Test error')
      transport({ error, context: { page: 'home' }, timestamp: new Date('2026-01-01') })
      expect(store).toHaveLength(1)
      expect(store[0].error).toBe(error)
      expect(store[0].context).toEqual({ page: 'home' })
    })

    it('enforces the max limit', () => {
      const store: Array<{ error: Error; context?: Record<string, unknown>; timestamp: Date }> = []
      const transport = memoryTransport(3, store)
      for (let i = 0; i < 10; i++) {
        transport({ error: new Error(`err${i}`), context: {}, timestamp: new Date() })
      }
      expect(store).toHaveLength(3)
      // Should keep the most recent 3
      expect(store[0].error.message).toBe('err7')
      expect(store[1].error.message).toBe('err8')
      expect(store[2].error.message).toBe('err9')
    })

    it('handles exact max limit without trimming', () => {
      const store: Array<{ error: Error; context?: Record<string, unknown>; timestamp: Date }> = []
      const transport = memoryTransport(5, store)
      for (let i = 0; i < 5; i++) {
        transport({ error: new Error(`err${i}`), context: {}, timestamp: new Date() })
      }
      expect(store).toHaveLength(5)
    })
  })

  describe('ErrorReporter.report', () => {
    it('sends errors to all registered transports', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const store: Array<{ error: Error; context?: Record<string, unknown>; timestamp: Date }> = []
      const reporter = new ErrorReporter([consoleTransport, memoryTransport(50, store)])
      reporter.report(new Error('multi-transport error'))

      expect(consoleSpy).toHaveBeenCalledTimes(1)
      expect(store).toHaveLength(1)
      expect(store[0].error.message).toBe('multi-transport error')
      consoleSpy.mockRestore()
    })

    it('passes optional context to transports', () => {
      const store: Array<{ error: Error; context?: Record<string, unknown>; timestamp: Date }> = []
      const reporter = new ErrorReporter([memoryTransport(50, store)])
      reporter.report(new Error('context error'), { userId: 'u1', action: 'click' })
      expect(store[0].context).toEqual({ userId: 'u1', action: 'click' })
    })

    it('throws when called with no transports', () => {
      const reporter = new ErrorReporter([])
      expect(() => reporter.report(new Error('no transports'))).toThrow()
    })
  })

  describe('singleton instance', () => {
    it('exposes getRecentErrors returning last 50 errors from memory store', () => {
      const reporter = new ErrorReporter([consoleTransport, memoryTransport(50)])
      for (let i = 0; i < 55; i++) {
        reporter.report(new Error(`err${i}`))
      }
      const recent = reporter.getRecentErrors()
      expect(recent).toHaveLength(50)
      expect(recent[0].error.message).toBe('err5') // first stored after trim
      expect(recent[49].error.message).toBe('err54')
    })

    it('getRecentErrors returns empty array when no memory transport used', () => {
      // Use a separate store not connected to the singleton
      const isolatedStore: { error: Error; context?: Record<string, unknown>; timestamp: Date }[] = []
      const reporter = new ErrorReporter([consoleTransport, memoryTransport(50, isolatedStore)])
      reporter.report(new Error('test'))
      expect(reporter.getRecentErrors()).toHaveLength(0)
    })
  })
})
