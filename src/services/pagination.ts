/**
 * Paginates an array and returns a subset of items for the specified page.
 * @param items - The array to paginate
 * @param page - The page number (1-indexed)
 * @param pageSize - The number of items per page
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
  if (pageSize <= 0) {
    throw new Error('Page size must be greater than 0')
  }

  if (page <= 0) {
    throw new Error('Page must be greater than 0')
  }

  const total = items.length
  const pages = Math.ceil(total / pageSize)
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const data = items.slice(startIndex, endIndex)
  const hasNext = page < pages

  return { data, total, pages, hasNext }
}
