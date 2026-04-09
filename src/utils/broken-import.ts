import { NonExistent } from '@/nonexistent/module'

export function getBrokenImport(): string {
  return NonExistent.name
}
