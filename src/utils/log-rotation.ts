import * as fs from 'fs'
import * as path from 'path'

export interface RotatingFileTransportOptions {
  /** Maximum file size in bytes before rotation */
  maxSize: number
  /** Number of backup files to keep */
  maxFiles: number
}

export class RotatingFileTransport {
  private readonly path: string
  private readonly maxSize: number
  private readonly maxFiles: number

  constructor(path: string, options: RotatingFileTransportOptions) {
    this.path = path
    this.maxSize = options.maxSize
    this.maxFiles = options.maxFiles
  }

  private getCurrentSize(): number {
    try {
      return fs.statSync(this.path).size
    } catch {
      return 0
    }
  }

  private rotate(): void {
    // Remove the oldest backup if it would exceed maxFiles after this rotation
    const oldestBackup = `${this.path}.${this.maxFiles}`
    try {
      fs.unlinkSync(oldestBackup)
    } catch {
      // ignore if doesn't exist
    }

    // Shift existing backups: n -> n+1
    for (let i = this.maxFiles - 1; i >= 1; i--) {
      const src = `${this.path}.${i}`
      const dst = `${this.path}.${i + 1}`
      try {
        fs.renameSync(src, dst)
      } catch {
        // ignore if doesn't exist
      }
    }

    // Rename current file to .1
    try {
      fs.renameSync(this.path, `${this.path}.1`)
    } catch {
      // ignore if doesn't exist
    }
  }

  private write(line: string): void {
    const lineBytes = Buffer.byteLength(line, 'utf-8') + 1 // +1 for newline

    if (this.getCurrentSize() + lineBytes > this.maxSize) {
      this.rotate()
    }

    fs.appendFileSync(this.path, line + '\n')
  }

  /**
   * Write a log line. Implements LogTransport.
   */
  writeLine(line: string): void {
    this.write(line)
  }
}
