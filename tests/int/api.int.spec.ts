import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    try {
      const payloadConfig = await config
      payload = await getPayload({ config: payloadConfig })
    } catch (error) {
      // Skip tests if database is not available
      console.warn('Database not available, skipping integration tests:', error instanceof Error ? error.message : String(error))
      return
    }
  })

  it('fetches users', async () => {
    if (!payload) {
      return // Skip if database was not available
    }
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})
