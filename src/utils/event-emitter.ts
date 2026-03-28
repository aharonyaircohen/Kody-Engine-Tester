type EventHandler<T extends unknown[] = []> = (...args: T) => void

type HandlerEntry = {
  original: EventHandler
  wrapped: EventHandler
}

export class EventEmitter<TEventMap extends Record<string, unknown[] | void> = Record<string, unknown[]>> {
  private listeners: Map<keyof TEventMap, Set<EventHandler>> = new Map()
  private onceWrappers: Map<EventHandler, HandlerEntry> = new Map()

  on<K extends keyof TEventMap>(event: K, handler: EventHandler<TEventMap[K] extends void ? [] : TEventMap[K] extends unknown[] ? TEventMap[K] : [TEventMap[K]]>): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler as EventHandler)
    return this
  }

  once<K extends keyof TEventMap>(event: K, handler: EventHandler<TEventMap[K] extends void ? [] : TEventMap[K] extends unknown[] ? TEventMap[K] : [TEventMap[K]]>): this {
    const wrappedHandler: EventHandler = (...args: unknown[]) => {
      (handler as EventHandler)(...args)
      this.removeOnceWrapper(event, handler as EventHandler)
    }
    this.onceWrappers.set(handler as EventHandler, { original: handler as EventHandler, wrapped: wrappedHandler })
    this.on(event, wrappedHandler)
    return this
  }

  off<K extends keyof TEventMap>(event: K, handler: EventHandler<TEventMap[K] extends void ? [] : TEventMap[K] extends unknown[] ? TEventMap[K] : [TEventMap[K]]>): this {
    const actualHandler = this.onceWrappers.get(handler as EventHandler)?.wrapped ?? handler
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.delete(actualHandler as EventHandler)
      if (handlers.size === 0) {
        this.listeners.delete(event)
      }
    }
    this.onceWrappers.delete(handler as EventHandler)
    return this
  }

  private removeOnceWrapper<K extends keyof TEventMap>(event: K, handler: EventHandler): void {
    const entry = this.onceWrappers.get(handler)
    if (entry) {
      const handlers = this.listeners.get(event)
      if (handlers) {
        handlers.delete(entry.wrapped)
        if (handlers.size === 0) {
          this.listeners.delete(event)
        }
      }
      this.onceWrappers.delete(handler)
    }
  }

  emit<K extends keyof TEventMap>(event: K, ...args: TEventMap[K] extends void ? [] : TEventMap[K] extends unknown[] ? TEventMap[K] : [TEventMap[K]]): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      for (const handler of handlers) {
        handler(...(args as unknown[]))
      }
    }
  }

  removeAllListeners(event?: keyof TEventMap): this {
    if (event !== undefined) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
    return this
  }
}
