export interface RetryQueueOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffFactor?: number
}

interface QueueEntry<T> {
  item: T
  handler: (item: T) => Promise<void>
  attempts: number
  lastError?: Error
}

export interface DeadLetterItem<T> {
  item: T
  attempts: number
  lastError: Error
}

export interface RetryEvent<T> {
  item: T
  attempt: number
  error: Error
  nextDelay: number
}

export interface QueueStats {
  processed: number
  failed: number
  retrying: number
  dead: number
}

export class RetryQueue<T> {
  private pending: QueueEntry<T>[] = []
  readonly deadLetter: DeadLetterItem<T>[] = []

  private readonly maxRetries: number
  private readonly initialDelay: number
  private readonly maxDelay: number
  private readonly backoffFactor: number

  private retryCallbacks: Array<(event: RetryEvent<T>) => void> = []
  private deadLetterCallbacks: Array<(item: DeadLetterItem<T>) => void> = []

  private _processed = 0
  private _failedAttempts = 0
  private _retrying = 0
  private _dead = 0

  constructor(options: RetryQueueOptions = {}) {
    this.maxRetries = options.maxRetries ?? 3
    this.initialDelay = options.initialDelay ?? 1000
    this.maxDelay = options.maxDelay ?? 30000
    this.backoffFactor = options.backoffFactor ?? 2
  }

  enqueue(item: T, handler: (item: T) => Promise<void>): void {
    this.pending.push({ item, handler, attempts: 0 })
  }

  onRetry(callback: (event: RetryEvent<T>) => void): void {
    this.retryCallbacks.push(callback)
  }

  onDeadLetter(callback: (item: DeadLetterItem<T>) => void): void {
    this.deadLetterCallbacks.push(callback)
  }

  async process(): Promise<void> {
    const toProcess = this.pending.splice(0)

    for (const entry of toProcess) {
      await this._processEntry(entry)
    }
  }

  private async _processEntry(entry: QueueEntry<T>): Promise<void> {
    while (true) {
      try {
        await entry.handler(entry.item)
        this._processed++
        if (entry.attempts > 0) {
          this._retrying--
        }
        return
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        entry.attempts++
        entry.lastError = err
        this._failedAttempts++

        if (entry.attempts > this.maxRetries) {
          if (entry.attempts > 1) {
            this._retrying--
          }
          const dead: DeadLetterItem<T> = {
            item: entry.item,
            attempts: entry.attempts,
            lastError: err,
          }
          this.deadLetter.push(dead)
          this._dead++
          for (const cb of this.deadLetterCallbacks) {
            cb(dead)
          }
          return
        }

        const delay = Math.min(
          this.initialDelay * Math.pow(this.backoffFactor, entry.attempts - 1),
          this.maxDelay,
        )

        const retryEvent: RetryEvent<T> = {
          item: entry.item,
          attempt: entry.attempts,
          error: err,
          nextDelay: delay,
        }
        for (const cb of this.retryCallbacks) {
          cb(retryEvent)
        }

        if (entry.attempts === 1) {
          this._retrying++
        }

        await new Promise<void>((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  stats(): QueueStats {
    return {
      processed: this._processed,
      failed: this._failedAttempts,
      retrying: this._retrying,
      dead: this._dead,
    }
  }
}
