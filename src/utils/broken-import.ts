import { something } from '@/nonexistent/module'

export function getBrokenImport(): string {
  return something
}
