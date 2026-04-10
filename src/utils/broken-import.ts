import { something } from '@/nonexistent/module'

export function useBrokenImport(): string {
  return something
}
