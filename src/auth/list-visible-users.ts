import type { Payload, Where, CollectionSlug } from 'payload'

import type { User } from '../payload-types'
import type { AuthenticatedUser, RbacRole } from './auth-service'

const HIDDEN_ROLES: RbacRole[] = ['admin']

export interface ListVisibleUsersPagination {
  page: number
  limit: number
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
    user: AuthenticatedUser,
    pagination: ListVisibleUsersPagination,
  ): Promise<ListVisibleUsersResult> {
    const { page, limit } = pagination

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
