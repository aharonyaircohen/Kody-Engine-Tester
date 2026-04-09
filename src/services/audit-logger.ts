import * as fs from 'fs'
import * as path from 'path'

const DEFAULT_AUDIT_LOG_PATH = path.join(process.cwd(), 'logs', 'audit.jsonl')

let auditLogFilePath = DEFAULT_AUDIT_LOG_PATH

export interface AuditEvent {
  action: string
  userId: string
  resource: string
  details?: string
}

export interface AuditLogOptions {
  filePath?: string
}

export function configureAuditLogger(options: AuditLogOptions): void {
  auditLogFilePath = options.filePath ?? DEFAULT_AUDIT_LOG_PATH
}

export function logAuditEvent(event: AuditEvent): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...event,
  }
  const line = JSON.stringify(logEntry)
  const dir = path.dirname(auditLogFilePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.appendFileSync(auditLogFilePath, line + '\n')
}

export function resetAuditLoggerConfig(): void {
  auditLogFilePath = DEFAULT_AUDIT_LOG_PATH
}
