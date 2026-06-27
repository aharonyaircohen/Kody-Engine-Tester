import { describe, it, expect } from 'vitest'
import { sayGoodbye } from './say-goodbye'

describe('sayGoodbye', () => {
  it('combines sayHello output with a goodbye message', () => {
    expect(sayGoodbye('World')).toBe('Hello, World! Goodbye, World!')
  })
})
