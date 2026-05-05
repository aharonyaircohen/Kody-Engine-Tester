export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let id: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (id) clearTimeout(id)
    id = setTimeout(() => fn(...args), ms)
  }
}
