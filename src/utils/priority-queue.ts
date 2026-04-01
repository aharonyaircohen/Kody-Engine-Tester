export type PriorityComparator<T> = (a: T, b: T) => number

interface PriorityItem<T> {
  value: T
  priority: number
}

class PriorityQueueImpl<T> {
  private items: readonly PriorityItem<T>[]

  private constructor(items: readonly PriorityItem<T>[]) {
    this.items = items
  }

  /**
   * Returns a new queue with the item enqueued.
   * Items with lower priority value are dequeued first (min-heap behavior).
   */
  enqueue(value: T, priority: number = 0): PriorityQueueImpl<T> {
    const newItem: PriorityItem<T> = { value, priority }
    return new PriorityQueueImpl([...this.items, newItem])
  }

  /**
   * Returns a tuple of (dequeued item, new queue).
   * Throws if the queue is empty.
   */
  dequeue(): [{ value: T; priority: number }, PriorityQueueImpl<T>] {
    if (this.isEmpty()) {
      throw new Error('Queue is empty')
    }
    const min = this.items.reduce((acc, item) =>
      item.priority < acc.priority ? item : acc
    )
    const idx = this.items.findIndex(
      (item) => item.priority === min.priority && item.value === min.value
    )
    const newItems = [...this.items.slice(0, idx), ...this.items.slice(idx + 1)]
    return [{ value: min.value, priority: min.priority }, new PriorityQueueImpl(newItems)]
  }

  /**
   * Returns the highest priority item without removing it.
   * Throws if the queue is empty.
   */
  peek(): { value: T; priority: number } {
    if (this.isEmpty()) {
      throw new Error('Queue is empty')
    }
    return this.items.reduce((acc, item) =>
      item.priority < acc.priority ? item : acc
    )
  }

  /**
   * Returns true if the queue contains no items.
   */
  isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * Returns the number of items in the queue.
   */
  size(): number {
    return this.items.length
  }

  /**
   * Returns all items as an array (a copy, unaffected by mutations).
   */
  toArray(): Array<{ value: T; priority: number }> {
    return [...this.items]
  }
}

/**
 * A functional priority queue implementation.
 * All operations are immutable — enqueue returns a new queue.
 */
export const PriorityQueue = {
  /**
   * Creates an empty priority queue.
   */
  empty<T>(): PriorityQueueImpl<T> {
    return new PriorityQueueImpl<T>([])
  },

  /**
   * Creates a priority queue from an array of items with priorities.
   */
  from<T>(items: Array<{ value: T; priority: number }>): PriorityQueueImpl<T> {
    return new PriorityQueueImpl<T>([...items])
  },
}
