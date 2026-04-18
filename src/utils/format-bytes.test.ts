import { describe, expect, it } from 'vitest'

import { formatBytes } from './format-bytes'

describe('formatBytes', () => {
  it('formats bytes as B when less than 1024', () => {
    expect(formatBytes(0)).toBe('0B')
    expect(formatBytes(1)).toBe('1B')
    expect(formatBytes(512)).toBe('512B')
    expect(formatBytes(1023)).toBe('1023B')
  })

  it('formats bytes as KB when less than 1 MB', () => {
    expect(formatBytes(1024)).toBe('1.0KB')
    expect(formatBytes(1536)).toBe('1.5KB')
    expect(formatBytes(2048)).toBe('2.0KB')
    expect(formatBytes(1024 * 1024 - 1)).toBe('1024.0KB')
  })

  it('formats bytes as MB when less than 1 GB', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0MB')
    expect(formatBytes(1024 * 1024 * 5)).toBe('5.0MB')
    expect(formatBytes(Math.floor(1024 * 1024 * 1.5))).toBe('1.5MB')
    expect(formatBytes(1024 * 1024 * 1024 - 1)).toBe('1024.0MB')
  })

  it('formats bytes as GB when at or above 1 GB', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0GB')
    expect(formatBytes(1024 * 1024 * 1024 * 2)).toBe('2.0GB')
    expect(formatBytes(Math.floor(1024 * 1024 * 1024 * 1.5))).toBe('1.5GB')
    expect(formatBytes(1024 * 1024 * 1024 * 10)).toBe('10.0GB')
  })
})
