export interface PaginationResult<T> {
  data: T[]
  total: number
  pages: number
  hasNext: boolean
}

/**
 * Paginates an array of items.
 * @param items - The array of items to paginate
 * @param page - The 1-based page number (1-indexed)
 * @param pageSize - The number of items per page
 * @returns Pagination result with sliced data and metadata
 */
export function paginate<T>(items: T[], page: number, pageSize: number): PaginationResult<T> {
  if (page < 1) {
    throw new Error('Page must be greater than 0')
  }
  if (pageSize < 1) {
    throw new Error('PageSize must be greater than 0')
  }

  const total = items.length
  const pages = Math.ceil(total / pageSize)
  const startIndex = (page - 1) * pageSize
  const data = items.slice(startIndex, startIndex + pageSize)
  const hasNext = page < pages

  return { data, total, pages, hasNext }
}
