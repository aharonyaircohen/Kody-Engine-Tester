import { nonexistentFunction } from '@/nonexistent/module'

export function getBrokenImport(): string {
  return nonexistentFunction()
}
