import type { Payload, Where } from 'payload'

import type { User } from '../payload-types'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const MAX_VISIBLE_USERS = 100

export class ListVisibleUsersService {
  constructor(private payload: Payload) {}

  async listVisibleUsers(
    user: User,
    pagination: { page?: number; limit?: number } = {},
  ) {
    const page = pagination.page ?? DEFAULT_PAGE
    const limit = Math.min(pagination.limit ?? DEFAULT_LIMIT, MAX_VISIBLE_USERS)

    return this.payload.find({
      collection: 'users',
      user,
      where: { role: { not_equals: 'admin' } } as Where,
      page,
      limit,
    })
  }
}