export interface PromisePoolError {
  index: number
  error: Error
}

export interface ProgressInfo {
  completed: number
  total: number
  active: number
}

export interface PromisePoolOptions {
  concurrency: number
  onProgress?: (info: ProgressInfo) => void
}

export class PromisePool<T> {
  private tasks: Array<() => Promise<T>> = []
  results: Array<T | undefined> = []
  errors: PromisePoolError[] = []

  private constructor(private readonly options: PromisePoolOptions) {}

  static create<T>(options: PromisePoolOptions): PromisePool<T> {
    return new PromisePool<T>(options)
  }

  add(fn: () => Promise<T>): this {
    this.tasks.push(fn)
    return this
  }

  async run(): Promise<this> {
    const { concurrency, onProgress } = this.options
    const total = this.tasks.length

    this.results = new Array(total).fill(undefined)
    this.errors = []

    let nextIndex = 0
    let completed = 0
    let active = 0

    const runNext = async (): Promise<void> => {
      while (nextIndex < total) {
        const index = nextIndex++
        active++

        try {
          this.results[index] = await this.tasks[index]()
        } catch (error) {
          this.errors.push({
            index,
            error: error instanceof Error ? error : new Error(String(error)),
          })
        } finally {
          active--
          completed++
          onProgress?.({ completed, total, active })
        }
      }
    }

    const workers = Array.from({ length: Math.min(concurrency, total) }, () => runNext())
    await Promise.all(workers)

    return this
  }
}
