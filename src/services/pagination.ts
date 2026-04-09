/**
 * Paginates an array by returning a slice of items for the given page along with metadata.
 * @param items - The array of items to paginate
 * @param page - The 1-based page number to retrieve
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

  return {
    data,
    total,
    pages,
    hasNext: page < pages,
  }
}
