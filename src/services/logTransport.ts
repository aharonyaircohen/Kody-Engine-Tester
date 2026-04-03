import * as fs from 'fs'
import type { LogEntry } from '../utils/logger'

export type { LogTransport } from '../utils/logger'
export { consoleTransport, fileTransport } from '../utils/logger'

export interface BufferedFileTransportOptions {
  flushInterval: number
}

export interface BufferedFileTransport {
  (line: string): void
  flush(): void
  destroy(): void
}

/**
 * A file transport that batches lines in memory and flushes them to disk
 * either after flushInterval ms or when flush() is called.
 */
export function bufferedFileTransport(
  path: string,
  options: BufferedFileTransportOptions,
): BufferedFileTransport {
  const { flushInterval } = options
  const buffer: string[] = []
  let timer: ReturnType<typeof setTimeout> | null = null

  function flush(): void {
    if (buffer.length === 0) return
    fs.appendFileSync(path, buffer.join('\n') + '\n')
    buffer.length = 0
  }

  function schedule(): void {
    if (timer) return
    timer = setTimeout(() => {
      flush()
      timer = null
    }, flushInterval)
  }

  const transport = ((line: string) => {
    buffer.push(line)
    schedule()
  }) as BufferedFileTransport

  transport.flush = flush
  transport.destroy = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    flush()
  }

  return transport
}
