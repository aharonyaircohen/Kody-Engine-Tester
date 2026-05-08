import { describe, it, expect } from 'vitest'
import { sayBoth } from './say-both'

describe('sayBoth', () => {
  it('combines sayHello and sayGoodbye output', () => {
    expect(sayBoth('World')).toBe('Hello, World! And finally: Hello, World! Goodbye, World!')
  })
})
