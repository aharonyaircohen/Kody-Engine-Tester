import * as fs from 'fs'
import * as path from 'path'

export interface AuditEvent {
  action: string
  userId: string
  resource: string
  details?: string
}

export interface AuditLoggerOptions {
  filePath?: string
}

function getDefaultLogPath(): string {
  return path.join(process.cwd(), 'audit.log.jsonl')
}

function formatJsonlEntry(event: AuditEvent, timestamp: Date): string {
  return JSON.stringify({ ...event, timestamp: timestamp.toISOString() }) + '\n'
}

export function logAuditEvent(
  event: AuditEvent,
  options?: AuditLoggerOptions
): void {
  const filePath = options?.filePath ?? getDefaultLogPath()
  const timestamp = new Date()
  const line = formatJsonlEntry(event, timestamp)
  fs.appendFileSync(filePath, line, 'utf-8')
}
