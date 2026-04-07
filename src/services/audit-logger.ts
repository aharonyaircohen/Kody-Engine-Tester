export interface AuditEvent {
  action: string
  userId: string
  resource: string
  details?: string
}

export class AuditLogger {
  private readonly filePath: string

  constructor(filePath?: string) {
    this.filePath = filePath ?? join('data', 'audit.log.jsonl')
  }

  logAuditEvent(event: AuditEvent): void {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs') as typeof import('fs')
    const dir = this.filePath.substring(0, this.filePath.lastIndexOf('/'))
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    const entry: AuditEvent & { timestamp: string } = {
      ...event,
      timestamp: new Date().toISOString(),
    }
    fs.appendFileSync(this.filePath, JSON.stringify(entry) + '\n')
  }
}

function join(...segments: string[]): string {
  return segments.join('/')
}