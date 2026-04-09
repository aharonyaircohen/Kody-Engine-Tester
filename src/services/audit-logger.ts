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

const DEFAULT_AUDIT_LOG_PATH = process.env.AUDIT_LOG_PATH ?? './audit.log'

export function logAuditEvent(event: AuditEvent, logPath: string = DEFAULT_AUDIT_LOG_PATH): void {
  const entry: AuditLogEntry = {
    ...event,
    timestamp: new Date().toISOString(),
  }
  fs.appendFileSync(logPath, JSON.stringify(entry) + '\n')
}
