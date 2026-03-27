export interface ErrorEntry {
  error: Error
  context?: Record<string, unknown>
  timestamp: Date
}

export type Transport = (entry: ErrorEntry) => void

function formatErrorEntry(entry: ErrorEntry): string {
  const lines = [
    `[ErrorReporter] ${entry.timestamp.toISOString()}`,
    `Error: ${entry.error.message}`,
    `Stack: ${entry.error.stack}`,
  ]
  if (entry.context) {
    lines.push(`Context: ${JSON.stringify(entry.context)}`)
  }
  return lines.join('\n')
}

export function consoleTransport(entry: ErrorEntry): void {
  // eslint-disable-next-line no-console
  console.error(formatErrorEntry(entry))
}

const _singletonMemoryStore: ErrorEntry[] = []

export function memoryTransport(max: number, store?: ErrorEntry[]): Transport {
  const mem = store ?? _singletonMemoryStore
  return (entry: ErrorEntry) => {
    mem.push(entry)
    while (mem.length > max) {
      mem.shift()
    }
  }
}

export class ErrorReporter {
  private transports: Transport[]

  constructor(transports: Transport[]) {
    this.transports = transports
  }

  report(error: Error, context?: Record<string, unknown>): void {
    if (this.transports.length === 0) {
      throw new Error('ErrorReporter: no transports registered')
    }
    const entry: ErrorEntry = { error, context, timestamp: new Date() }
    for (const transport of this.transports) {
      transport(entry)
    }
  }

  getRecentErrors(): ErrorEntry[] {
    return _singletonMemoryStore
  }

  /** Clears the singleton memory store. Intended for testing only. */
  reset(): void {
    _singletonMemoryStore.length = 0
  }
}

export const errorReporter = new ErrorReporter([consoleTransport, memoryTransport(50)])
