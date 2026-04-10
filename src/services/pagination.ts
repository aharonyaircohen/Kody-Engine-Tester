export interface PaginationResult<T> {
  data: T[]
  total: number
  pages: number
  hasNext: boolean
}

export function paginate<T>(items: T[], page: number, pageSize: number): PaginationResult<T> {
  if (page < 1) {
    throw new Error('page must be at least 1')
  }
  if (pageSize < 1) {
    throw new Error('pageSize must be at least 1')
  }

  const total = items.length
  const pages = Math.ceil(total / pageSize)
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const data = items.slice(startIndex, endIndex)
  const hasNext = page < pages

  return { data, total, pages, hasNext }
}
