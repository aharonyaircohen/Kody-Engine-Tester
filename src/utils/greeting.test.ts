import { describe, expect, it } from 'vitest'

import greeting from './greeting'

describe('greeting', () => {
  it('returns Hello, World!', () => {
    expect(greeting()).toBe('Hello, World!')
  })
})