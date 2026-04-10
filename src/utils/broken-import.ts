import { something } from '@/nonexistent/module'

export function brokenImport(): string {
  return something
}
