// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuditEvent {
  action: string
  userId: string
  resource: string
  details?: string
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_LOG_PATH = 'logs/audit.jsonl'

// ─── Implementation ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs') as typeof import('fs')

/**
 * Append an audit event as a JSON Lines entry to the audit log file.
 *
 * Each line is a JSON object with the event fields plus an ISO timestamp.
 * The file is created / appended to if it does not exist.
 *
 * @param event  - The audit event to log
 * @param logPath - Path to the JSONL log file (defaults to logs/audit.jsonl)
 */
export function logAuditEvent(event: AuditEvent, logPath: string = DEFAULT_LOG_PATH): void {
  const line = JSON.stringify({
    ...event,
    timestamp: new Date().toISOString(),
  })
  fs.appendFileSync(logPath, line + '\n')
}