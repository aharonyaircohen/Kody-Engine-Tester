type StateConfig<E extends string> = {
  on?: Partial<Record<E, string>>
}

type MachineConfig<S extends string, E extends string> = {
  initial: S
  states: Record<S, StateConfig<E>>
}

type TransitionCallback<S extends string, E extends string> = (from: S, event: E, to: S) => void

type Machine<S extends string, E extends string> = {
  readonly current: S
  send(event: E): S
  canSend(event: E): boolean
  onTransition(callback: TransitionCallback<S, E>): () => void
  reset(): void
}

export function createMachine<S extends string, E extends string>(
  config: MachineConfig<S, E>,
): Machine<S, E> {
  let current: S = config.initial
  const callbacks = new Set<TransitionCallback<S, E>>()

  return {
    get current() {
      return current
    },

    send(event: E): S {
      const stateConfig = config.states[current]
      const next = stateConfig.on?.[event]
      if (next === undefined) {
        throw new Error(`Invalid transition: event "${event}" is not allowed in state "${current}"`)
      }
      const from = current
      current = next as S
      for (const cb of callbacks) {
        cb(from, event, current)
      }
      return current
    },

    canSend(event: E): boolean {
      return config.states[current].on?.[event] !== undefined
    },

    onTransition(callback: TransitionCallback<S, E>): () => void {
      callbacks.add(callback)
      return () => callbacks.delete(callback)
    },

    reset(): void {
      current = config.initial
    },
  }
}
