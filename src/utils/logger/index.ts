export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
}

export type LogFormatter = (entry: LogEntry) => string
export type LogTransport = (line: string) => void

export interface LoggerOptions {
  level?: LogLevel
  formatter?: LogFormatter
  transports?: LogTransport[]
  context?: Record<string, unknown>
}

// Formatters

export function jsonFormatter(entry: LogEntry): string {
  return JSON.stringify(entry)
}

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m',
  info: '\x1b[34m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
}
const RESET = '\x1b[0m'

export function prettyFormatter(entry: LogEntry): string {
  const color = LEVEL_COLORS[entry.level]
  const level = entry.level.toUpperCase().padEnd(5)
  const ctxStr = entry.context ? ` ${JSON.stringify(entry.context)}` : ''
  return `${color}[${entry.timestamp}] [${level}] ${entry.message}${ctxStr}${RESET}`
}

// Transports

export function consoleTransport(entry: LogEntry): void {
  const fn =
    entry.level === 'error' ? console.error
    : entry.level === 'warn' ? console.warn
    : console.log
  fn(entry.message)
}

function createFileTransport(path: string): LogTransport {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs') as typeof import('fs')
  return (line: string) => {
    fs.appendFileSync(path, line + '\n')
  }
}

// Logger

interface Logger {
  debug: (message: string, context?: Record<string, unknown>) => void
  info: (message: string, context?: Record<string, unknown>) => void
  warn: (message: string, context?: Record<string, unknown>) => void
  error: (message: string, context?: Record<string, unknown>) => void
  child: (context: Record<string, unknown>) => Logger
}

function createLoggerInternal(options: LoggerOptions = {}): Logger {
  const minLevel: LogLevel = options.level ?? 'info'
  const formatter: LogFormatter = options.formatter ?? prettyFormatter
  const transports: LogTransport[] = options.transports ?? [consoleTransport as unknown as LogTransport]
  let context: Record<string, unknown> = options.context ?? {}

  function dispatch(level: LogLevel, message: string, ctx?: Record<string, unknown>): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) return
    const merged = { ...context, ...ctx }
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: Object.keys(merged).length > 0 ? merged : undefined,
    }
    const line = formatter(entry)
    for (const transport of transports) {
      try {
        transport(line)
      } catch {
        // swallow to avoid crashing the app
      }
    }
  }

  const logger: Logger = {
    debug(message: string, ctx?: Record<string, unknown>) {
      dispatch('debug', message, ctx)
    },
    info(message: string, ctx?: Record<string, unknown>) {
      dispatch('info', message, ctx)
    },
    warn(message: string, ctx?: Record<string, unknown>) {
      dispatch('warn', message, ctx)
    },
    error(message: string, ctx?: Record<string, unknown>) {
      dispatch('error', message, ctx)
    },
    child(ctx: Record<string, unknown>): Logger {
      return createLoggerInternal({
        level: minLevel,
        formatter,
        transports,
        context: { ...context, ...ctx },
      })
    },
  }

  return logger
}

export { createLoggerInternal as createLogger }
export { createFileTransport as fileTransport }
