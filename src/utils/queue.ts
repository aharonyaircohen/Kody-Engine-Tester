export class Queue<T> {
  private items: T[] = []

  enqueue(item: T): void {
    this.items.push(item)
  }

  dequeue(): T {
    if (this.isEmpty()) throw new Error('Queue is empty')
    return this.items.shift()!
  }

  front(): T {
    if (this.isEmpty()) throw new Error('Queue is empty')
    return this.items[0]
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  size(): number {
    return this.items.length
  }

  toArray(): T[] {
    return [...this.items]
  }
}
