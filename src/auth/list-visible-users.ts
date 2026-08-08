import type { Payload, Where, CollectionSlug } from 'payload'

import type { User } from '../payload-types'
import type { RbacRole } from './auth-service'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const MAX_VISIBLE_USERS = 100
const HIDDEN_ROLES: RbacRole[] = ['admin']

export interface ListVisibleUsersPagination {
  page?: number
  limit?: number
}

export interface ListVisibleUsersResult {
  data: User[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export class ListVisibleUsersService {
  constructor(private payload: Payload) {}

  async listVisibleUsers(
    user: User,
    pagination: ListVisibleUsersPagination = {},
  ): Promise<ListVisibleUsersResult> {
    const rawPage = pagination.page ?? DEFAULT_PAGE
    const rawLimit = pagination.limit ?? DEFAULT_LIMIT
    const page = Math.max(1, Math.floor(rawPage))
    const limit = Math.min(MAX_VISIBLE_USERS, Math.max(1, Math.floor(rawLimit)))

    const result = await this.payload.find({
      collection: 'users' as CollectionSlug,
      user,
      where: { role: { not_in: HIDDEN_ROLES } } as Where,
      page,
      limit,
    })

    return {
      data: result.docs as User[],
      meta: {
        total: result.totalDocs,
        page: result.page ?? page,
        limit,
        totalPages: result.totalPages,
      },
    }
  }
}
