import * as fs from 'fs'
import type { LogTransport } from './index'

export function createFileTransport(path: string): LogTransport {
  return (line: string) => {
    fs.appendFileSync(path, line + '\n')
  }
}

export { createFileTransport as fileTransport }
