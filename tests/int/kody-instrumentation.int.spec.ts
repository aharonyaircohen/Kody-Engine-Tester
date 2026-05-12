/**
 * Phase 0 instrumentation smoke test for kody-engine.
 * Verifies that kody-engine 0.4.43 emits structured run events.
 *
 * Structured events are stored in .kody-engine/event-log.json and include:
 * - pipeline.started: emitted when a pipeline starts
 * - step.started: emitted when a step starts
 * - step.complete: emitted when a step completes
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, it, expect } from 'vitest'

interface KodyEvent {
  id: string
  runId: string
  event: string
  payload: Record<string, unknown>
  hooksFired: string[]
  hookErrors: Record<string, unknown>
  emittedAt: string
}

const EVENT_LOG_PATH = resolve(__dirname, '../../.kody-engine/event-log.json')

describe('kody-engine instrumentation smoke test', () => {
  describe('event-log.json exists and is valid', () => {
    it('should exist and be valid JSON', () => {
      const content = readFileSync(EVENT_LOG_PATH, 'utf-8')
      expect(() => JSON.parse(content)).not.toThrow()
    })

    it('should be an array of events', () => {
      const content = readFileSync(EVENT_LOG_PATH, 'utf-8')
      const events = JSON.parse(content)
      expect(Array.isArray(events)).toBe(true)
    })
  })

  describe('structured run events have correct shape', () => {
    const content = readFileSync(EVENT_LOG_PATH, 'utf-8')
    const events: KodyEvent[] = JSON.parse(content)

    it('should have events with required fields', () => {
      for (const event of events) {
        expect(typeof event.id).toBe('string')
        expect(event.id.length).toBeGreaterThan(0)

        expect(typeof event.runId).toBe('string')
        expect(event.runId.length).toBeGreaterThan(0)

        expect(typeof event.event).toBe('string')
        expect(event.event.length).toBeGreaterThan(0)

        expect(typeof event.payload).toBe('object')
        expect(event.payload).not.toBeNull()

        expect(Array.isArray(event.hooksFired)).toBe(true)

        expect(typeof event.hookErrors).toBe('object')
        expect(event.hookErrors).not.toBeNull()

        expect(typeof event.emittedAt).toBe('string')
        expect(event.emittedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      }
    })

    it('should emit pipeline.started events', () => {
      const pipelineStartedEvents = events.filter((e) => e.event === 'pipeline.started')
      expect(pipelineStartedEvents.length).toBeGreaterThan(0)
    })

    it('should emit step.started events', () => {
      const stepStartedEvents = events.filter((e) => e.event === 'step.started')
      expect(stepStartedEvents.length).toBeGreaterThan(0)
    })

    it('should emit step.complete events', () => {
      const stepCompleteEvents = events.filter((e) => e.event === 'step.complete')
      expect(stepCompleteEvents.length).toBeGreaterThan(0)
    })
  })

  describe('pipeline.started events have correct payload', () => {
    const content = readFileSync(EVENT_LOG_PATH, 'utf-8')
    const events: KodyEvent[] = JSON.parse(content)

    it('should include runId and issueNumber in pipeline.started payload', () => {
      const pipelineStartedEvents = events.filter((e) => e.event === 'pipeline.started')
      for (const event of pipelineStartedEvents) {
        expect(event.payload.runId).toBeDefined()
        expect(typeof event.payload.runId).toBe('string')
        expect(event.payload.issueNumber).toBeDefined()
        expect(typeof event.payload.issueNumber).toBe('number')
      }
    })
  })

  describe('step events have correct payload', () => {
    const content = readFileSync(EVENT_LOG_PATH, 'utf-8')
    const events: KodyEvent[] = JSON.parse(content)

    it('should include runId and step in step.started payload', () => {
      const stepStartedEvents = events.filter((e) => e.event === 'step.started')
      for (const event of stepStartedEvents) {
        expect(event.payload.runId).toBeDefined()
        expect(typeof event.payload.runId).toBe('string')
        expect(event.payload.step).toBeDefined()
        expect(typeof event.payload.step).toBe('string')
      }
    })

    it('should include runId and step in step.complete payload', () => {
      const stepCompleteEvents = events.filter((e) => e.event === 'step.complete')
      for (const event of stepCompleteEvents) {
        expect(event.payload.runId).toBeDefined()
        expect(typeof event.payload.runId).toBe('string')
        expect(event.payload.step).toBeDefined()
        expect(typeof event.payload.step).toBe('string')
      }
    })
  })

  describe('events have valid timestamps', () => {
    const content = readFileSync(EVENT_LOG_PATH, 'utf-8')
    const events: KodyEvent[] = JSON.parse(content)

    it('should have valid ISO8601 timestamps for all events', () => {
      for (const event of events) {
        const parsedDate = new Date(event.emittedAt)
        expect(isNaN(parsedDate.getTime())).toBe(false)
      }
    })

    it('should have monotonically increasing timestamps within each run', () => {
      // Group events by runId
      const eventsByRun = new Map<string, KodyEvent[]>()
      for (const event of events) {
        const runEvents = eventsByRun.get(event.runId) || []
        runEvents.push(event)
        eventsByRun.set(event.runId, runEvents)
      }

      // For each run, timestamps should be increasing
      for (const [runId, runEvents] of eventsByRun) {
        const sortedEvents = [...runEvents].sort(
          (a, b) => new Date(a.emittedAt).getTime() - new Date(b.emittedAt).getTime()
        )
        for (let i = 1; i < sortedEvents.length; i++) {
          const prevTime = new Date(sortedEvents[i - 1].emittedAt).getTime()
          const currTime = new Date(sortedEvents[i].emittedAt).getTime()
          expect(currTime).toBeGreaterThanOrEqual(prevTime)
        }
      }
    })
  })

  describe('event IDs are unique', () => {
    const content = readFileSync(EVENT_LOG_PATH, 'utf-8')
    const events: KodyEvent[] = JSON.parse(content)

    it('should have unique event IDs', () => {
      const ids = events.map((e) => e.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })
})
