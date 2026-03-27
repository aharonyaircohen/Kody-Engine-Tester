type Handler<T> = (payload: T) => void

interface HistoryEntry<T> {
  payload: T
  timestamp: number
}

interface Bus<TMessages extends Record<string, unknown>> {
  publish<K extends keyof TMessages>(channel: K, payload: TMessages[K]): void
  subscribe<K extends keyof TMessages>(channel: K, handler: Handler<TMessages[K]>): () => void
  subscribeOnce<K extends keyof TMessages>(channel: K, handler: Handler<TMessages[K]>): () => void
  history<K extends keyof TMessages>(channel: K, limit?: number): TMessages[K][]
  clear(channel?: keyof TMessages): void
}

export function createBus<TMessages extends Record<string, unknown>>(): Bus<TMessages> {
  const subscribers = new Map<keyof TMessages, Set<Handler<unknown>>>()
  const historyMap = new Map<keyof TMessages, HistoryEntry<unknown>[]>()

  function getSubscribers(channel: keyof TMessages): Set<Handler<unknown>> {
    if (!subscribers.has(channel)) {
      subscribers.set(channel, new Set())
    }
    return subscribers.get(channel)!
  }

  function getHistory(channel: keyof TMessages): HistoryEntry<unknown>[] {
    if (!historyMap.has(channel)) {
      historyMap.set(channel, [])
    }
    return historyMap.get(channel)!
  }

  return {
    publish<K extends keyof TMessages>(channel: K, payload: TMessages[K]): void {
      getHistory(channel).push({ payload, timestamp: Date.now() })
      for (const handler of getSubscribers(channel)) {
        handler(payload)
      }
    },

    subscribe<K extends keyof TMessages>(channel: K, handler: Handler<TMessages[K]>): () => void {
      const handlers = getSubscribers(channel)
      handlers.add(handler as Handler<unknown>)
      return () => {
        handlers.delete(handler as Handler<unknown>)
      }
    },

    subscribeOnce<K extends keyof TMessages>(
      channel: K,
      handler: Handler<TMessages[K]>,
    ): () => void {
      const handlers = getSubscribers(channel)
      const wrapper: Handler<unknown> = (payload) => {
        handlers.delete(wrapper)
        ;(handler as Handler<unknown>)(payload)
      }
      handlers.add(wrapper)
      return () => {
        handlers.delete(wrapper)
      }
    },

    history<K extends keyof TMessages>(channel: K, limit?: number): TMessages[K][] {
      const entries = getHistory(channel)
      const slice = limit !== undefined ? entries.slice(-limit) : entries.slice()
      return slice.map((e) => e.payload as TMessages[K])
    },

    clear(channel?: keyof TMessages): void {
      if (channel !== undefined) {
        historyMap.delete(channel)
      } else {
        historyMap.clear()
      }
    },
  }
}
