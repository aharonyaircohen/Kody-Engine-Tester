import * as fs from 'fs'
import * as path from 'path'

export const AUDIT_LOG_PATH = path.join(process.cwd(), 'logs', 'audit.jsonl')

export interface AuditEvent {
  action: string
  userId: string
  resource: string
  details?: string
}

export function logAuditEvent(event: AuditEvent): void {
  const line: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    action: event.action,
    userId: event.userId,
    resource: event.resource,
  }
  if (event.details !== undefined) {
    line.details = event.details
  }
  const dir = path.dirname(AUDIT_LOG_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.appendFileSync(AUDIT_LOG_PATH, JSON.stringify(line) + '\n')
}