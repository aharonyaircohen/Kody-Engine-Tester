import { describe, it, expect, vi } from 'vitest'
import { createMachine } from './state-machine'

type TrafficState = 'red' | 'yellow' | 'green'
type TrafficEvent = 'NEXT' | 'RESET'

const trafficConfig = {
  initial: 'red' as TrafficState,
  states: {
    red: { on: { NEXT: 'green', RESET: 'red' } },
    green: { on: { NEXT: 'yellow' } },
    yellow: { on: { NEXT: 'red', RESET: 'red' } },
  },
}

describe('createMachine', () => {
  it('starts in the initial state', () => {
    const machine = createMachine<TrafficState, TrafficEvent>(trafficConfig)
    expect(machine.current).toBe('red')
  })

  it('transitions to the next state on send()', () => {
    const machine = createMachine<TrafficState, TrafficEvent>(trafficConfig)
    const next = machine.send('NEXT')
    expect(next).toBe('green')
    expect(machine.current).toBe('green')
  })

  it('follows the full happy-path cycle', () => {
    const machine = createMachine<TrafficState, TrafficEvent>(trafficConfig)
    machine.send('NEXT') // red → green
    machine.send('NEXT') // green → yellow
    machine.send('NEXT') // yellow → red
    expect(machine.current).toBe('red')
  })

  it('throws on an invalid transition', () => {
    const machine = createMachine<TrafficState, TrafficEvent>(trafficConfig)
    // green has no RESET transition
    machine.send('NEXT') // red → green
    expect(() => machine.send('RESET')).toThrow(
      'Invalid transition: event "RESET" is not allowed in state "green"',
    )
  })

  it('does not change state after an invalid transition', () => {
    const machine = createMachine<TrafficState, TrafficEvent>(trafficConfig)
    machine.send('NEXT') // red → green
    try {
      machine.send('RESET')
    } catch {
      // expected
    }
    expect(machine.current).toBe('green')
  })

  it('canSend() returns true for valid transitions', () => {
    const machine = createMachine<TrafficState, TrafficEvent>(trafficConfig)
    expect(machine.canSend('NEXT')).toBe(true)
    expect(machine.canSend('RESET')).toBe(true)
  })

  it('canSend() returns false for invalid transitions', () => {
    const machine = createMachine<TrafficState, TrafficEvent>(trafficConfig)
    machine.send('NEXT') // red → green
    expect(machine.canSend('RESET')).toBe(false)
  })

  it('calls onTransition callback with from, event, to', () => {
    const machine = createMachine<TrafficState, TrafficEvent>(trafficConfig)
    const cb = vi.fn()
    machine.onTransition(cb)
    machine.send('NEXT')
    expect(cb).toHaveBeenCalledOnce()
    expect(cb).toHaveBeenCalledWith('red', 'NEXT', 'green')
  })

  it('calls all registered callbacks on transition', () => {
    const machine = createMachine<TrafficState, TrafficEvent>(trafficConfig)
    const cb1 = vi.fn()
    const cb2 = vi.fn()
    machine.onTransition(cb1)
    machine.onTransition(cb2)
    machine.send('NEXT')
    expect(cb1).toHaveBeenCalledOnce()
    expect(cb2).toHaveBeenCalledOnce()
  })

  it('does not call callback after unsubscribing', () => {
    const machine = createMachine<TrafficState, TrafficEvent>(trafficConfig)
    const cb = vi.fn()
    const unsubscribe = machine.onTransition(cb)
    unsubscribe()
    machine.send('NEXT')
    expect(cb).not.toHaveBeenCalled()
  })

  it('does not call callback on invalid (throws) transition', () => {
    const machine = createMachine<TrafficState, TrafficEvent>(trafficConfig)
    machine.send('NEXT') // red → green
    const cb = vi.fn()
    machine.onTransition(cb)
    expect(() => machine.send('RESET')).toThrow()
    expect(cb).not.toHaveBeenCalled()
  })

  it('reset() returns to the initial state', () => {
    const machine = createMachine<TrafficState, TrafficEvent>(trafficConfig)
    machine.send('NEXT') // red → green
    machine.send('NEXT') // green → yellow
    machine.reset()
    expect(machine.current).toBe('red')
  })

  it('can transition normally after reset()', () => {
    const machine = createMachine<TrafficState, TrafficEvent>(trafficConfig)
    machine.send('NEXT') // red → green
    machine.reset()
    machine.send('NEXT') // red → green again
    expect(machine.current).toBe('green')
  })
})
