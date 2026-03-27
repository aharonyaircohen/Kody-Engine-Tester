type EventHandler<T = unknown> = (data: T) => void

interface ErrorEventData {
  error: Error
  event: string
  args: unknown[]
}

type OnceHandlerEntry = {
  onceHandler: EventHandler
  originalHandler: EventHandler
}

export class EventBus<_TEventMap extends Record<string, unknown> = Record<string, unknown>> {
  private listenerMap: Map<string, Set<EventHandler>> = new Map()
  private maxListeners: number
  private wildcardListeners: Map<string, Set<EventHandler>> = new Map()
  private onceHandlers: Map<EventHandler, OnceHandlerEntry> = new Map()

  constructor(options?: { maxListeners?: number }) {
    this.maxListeners = options?.maxListeners ?? 10
  }

  on(event: string, handler: EventHandler): this {
    this.addListener(event, handler, false)
    return this
  }

  once(event: string, handler: EventHandler): this {
    this.addListener(event, handler, true)
    return this
  }

  off(event: string, handler: EventHandler): this {
    this.removeListener(event, handler)
    return this
  }

  emit(event: string, data?: unknown): void {
    const handlers = this.listenerMap.get(event) ?? new Set()
    const wildcardHandlers = this.getWildcardHandlers(event, handlers)

    const errorHandlers = this.listenerMap.get('error') ?? new Set()

    for (const handler of handlers) {
      try {
        handler(data)
      } catch (err) {
        this.handleError(event, err, [data], errorHandlers)
      }
    }

    for (const handler of wildcardHandlers) {
      try {
        handler(data)
      } catch (err) {
        this.handleError(event, err, [data], errorHandlers)
      }
    }
  }

  listenerCount(event: string): number {
    return this.listenerMap.get(event)?.size ?? 0
  }

  listeners(event: string): EventHandler[] {
    return Array.from(this.listenerMap.get(event) ?? [])
  }

  removeAllListeners(event?: string): this {
    if (event) {
      this.listenerMap.delete(event)
      this.wildcardListeners.delete(event)
    } else {
      this.listenerMap.clear()
      this.wildcardListeners.clear()
      this.onceHandlers.clear()
    }
    return this
  }

  private addListener(event: string, handler: EventHandler, once: boolean): void {
    const isWildcard = event.includes('*')

    if (once) {
      const onceHandler: EventHandler = (data) => {
        handler(data)
        this.removeListener(event, onceHandler)
      }
      this.onceHandlers.set(onceHandler, { onceHandler, originalHandler: handler })

      if (!this.listenerMap.has(event)) {
        this.listenerMap.set(event, new Set())
      }
      this.listenerMap.get(event)!.add(onceHandler)

      if (isWildcard) {
        const prefix = event.replace('*', '')
        if (!this.wildcardListeners.has(prefix)) {
          this.wildcardListeners.set(prefix, new Set())
        }
        this.wildcardListeners.get(prefix)!.add(onceHandler)
      }
      return
    }

    if (isWildcard) {
      const prefix = event.replace('*', '')
      if (!this.wildcardListeners.has(prefix)) {
        this.wildcardListeners.set(prefix, new Set())
      }
      this.wildcardListeners.get(prefix)!.add(handler)

      if (this.wildcardListeners.get(prefix)!.size > this.maxListeners) {
        console.warn(`Max listeners (${this.maxListeners}) exceeded for wildcard "${event}"`)
      }
    } else {
      if (!this.listenerMap.has(event)) {
        this.listenerMap.set(event, new Set())
      }
      this.listenerMap.get(event)!.add(handler)

      if (this.listenerMap.get(event)!.size > this.maxListeners) {
        console.warn(`Max listeners (${this.maxListeners}) exceeded for event "${event}"`)
      }
    }
  }

  private removeListener(event: string, handler: EventHandler): void {
    const handlers = this.listenerMap.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.listenerMap.delete(event)
      }
    }

    this.onceHandlers.delete(handler)

    const prefix = event.replace('*', '')
    const wildcardHandlers = this.wildcardListeners.get(prefix)
    if (wildcardHandlers) {
      wildcardHandlers.delete(handler)
      if (wildcardHandlers.size === 0) {
        this.wildcardListeners.delete(prefix)
      }
    }
  }

  private getWildcardHandlers(event: string, directHandlers: Set<EventHandler>): EventHandler[] {
    const handlers: EventHandler[] = []
    for (const [prefix, handlersSet] of this.wildcardListeners) {
      if (event.startsWith(prefix) && prefix.length > 0) {
        for (const handler of handlersSet) {
          if (!directHandlers.has(handler)) {
            handlers.push(handler)
          }
        }
      }
    }
    return handlers
  }

  private handleError(
    event: string,
    err: unknown,
    args: unknown[],
    errorHandlers: Set<EventHandler>,
  ): void {
    const errorData: ErrorEventData = {
      error: err instanceof Error ? err : new Error(String(err)),
      event,
      args,
    }

    if (errorHandlers.size > 0) {
      for (const handler of errorHandlers) {
        try {
          handler(errorData)
        } catch {
          // Ignore errors in error handler
        }
      }
    } else {
      throw errorData.error
    }
  }
}
