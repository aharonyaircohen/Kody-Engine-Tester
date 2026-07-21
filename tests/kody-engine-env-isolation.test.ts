import { describe, it, expect } from 'vitest'

describe('environment isolation', () => {
  it('does not expose ALL_SECRETS to test processes', () => {
    expect(process.env.ALL_SECRETS).toBeUndefined()
  })

  it('does not expose KODY_SERVICE_KEY to test processes', () => {
    expect(process.env.KODY_SERVICE_KEY).toBeUndefined()
  })
})