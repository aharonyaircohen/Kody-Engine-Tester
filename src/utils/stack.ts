export class Stack<T> {
  private items: T[] = []

  push(item: T): void {
    this.items.push(item)
  }

  pop(): T {
    if (this.isEmpty()) throw new Error('Stack is empty')
    return this.items.pop()!
  }

  peek(): T {
    if (this.isEmpty()) throw new Error('Stack is empty')
    return this.items[this.items.length - 1]
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
