import type { PathLike } from 'fs'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs') as typeof import('fs')

export interface AuditEvent {
  action: string
  userId: string
  resource: string
  details?: string
}

export interface AuditLogEntry extends AuditEvent {
  timestamp: string
}

const DEFAULT_LOG_PATH: PathLike = process.env.AUDIT_LOG_PATH ?? './audit.log'

/**
 * Appends a timestamped JSON line to the audit log file.
 * Each line is a valid JSON object with ISO timestamp + event fields.
 */
export function logAuditEvent(
  event: AuditEvent,
  logPath: PathLike = DEFAULT_LOG_PATH,
): void {
  const entry: AuditLogEntry = {
    ...event,
    timestamp: new Date().toISOString(),
  }
  fs.appendFileSync(logPath, JSON.stringify(entry) + '\n')
}