import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

// Requires a running Postgres — skip when DATABASE_URI / POSTGRES_URL is not set.
const dbUrl = process.env.DATABASE_URI ?? process.env.POSTGRES_URL
const describeIfDb = dbUrl ? describe : describe.skip

let payload: Payload

describeIfDb('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})
