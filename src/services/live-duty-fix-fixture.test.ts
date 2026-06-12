import { describe, expect, it } from 'vitest'
import { liveDutyFixMessage } from './live-duty-fix-fixture'

describe('liveDutyFixMessage', () => {
  it('returns the fixture message', () => {
    expect(liveDutyFixMessage()).toBe('before review feedback')
  })
})