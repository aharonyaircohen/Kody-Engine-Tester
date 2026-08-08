import type { Payload } from 'payload'

import type { User } from '../payload-types'

export async function listVisibleUsers(payload: Payload, user: User) {
  return payload.find({
    collection: 'users',
    user,
    limit: 20,
  })
}
