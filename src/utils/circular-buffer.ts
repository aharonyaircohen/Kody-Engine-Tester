export class CircularBuffer<T> {
  private buffer: (T | undefined)[]
  private head = 0
  private tail = 0
  private count = 0

  constructor(private capacity: number) {
    if (capacity <= 0) throw new Error('Capacity must be positive')
    this.buffer = new Array(capacity)
  }

  add(item: T): void {
    this.buffer[this.tail] = item
    this.tail = (this.tail + 1) % this.capacity
    if (this.count < this.capacity) {
      this.count++
    } else {
      this.head = (this.head + 1) % this.capacity
    }
  }

  get(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.count; i++) {
      const idx = (this.head + i) % this.capacity
      result.push(this.buffer[idx] as T)
    }
    return result
  }

  size(): number {
    return this.count
  }
}
