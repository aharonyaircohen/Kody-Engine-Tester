/**
 * Paginates an array of items by slicing it into pages.
 * @param items - The array of items to paginate
 * @param page - The 1-based page number to retrieve
 * @param pageSize - The maximum number of items per page
 * @returns An object containing the paginated data and pagination metadata
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): {
  data: T[]
  total: number
  pages: number
  hasNext: boolean
} {
  if (page < 1) {
    throw new Error('Page must be greater than 0')
  }
  if (pageSize < 1) {
    throw new Error('Page size must be greater than 0')
  }

  const total = items.length
  const pages = Math.ceil(total / pageSize)
  const startIndex = (page - 1) * pageSize
  const data = items.slice(startIndex, startIndex + pageSize)
  const hasNext = page < pages

  return { data, total, pages, hasNext }
}
