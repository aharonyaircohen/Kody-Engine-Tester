import type { LogEntry } from './logger'

export type { LogEntry, LogFormatter, LogLevel } from './logger'
export { jsonFormatter } from './logger'

const LEVEL_PREFIXES: Record<string, string> = {
  debug: '[DEBUG]',
  info: '[INFO]',
  warn: '[WARN]',
  error: '[ERROR]',
}

/**
 * Produces a plain-text log line with ANSI color codes stripped.
 * Suitable for file output where colored console output is not wanted.
 */
export function textFormatter(entry: LogEntry): string {
  const level = LEVEL_PREFIXES[entry.level] ?? `[${entry.level.toUpperCase()}]`
  const ctxStr =
    entry.context && Object.keys(entry.context).length > 0
      ? ' ' + Object.entries(entry.context)
          .map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`)
          .join(' ')
      : ''
  return `[${entry.timestamp}] ${level} ${entry.message}${ctxStr}`
}
