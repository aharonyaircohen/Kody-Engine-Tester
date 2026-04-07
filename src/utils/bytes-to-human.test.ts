import { describe, expect, it } from 'vitest'

import { bytesToHuman } from './bytes-to-human'

describe('bytesToHuman', () => {
  it('returns "0 B" for 0 bytes', () => {
    expect(bytesToHuman(0)).toBe('0 B')
  })

  it('handles bytes', () => {
    expect(bytesToHuman(1)).toBe('1.00 B')
    expect(bytesToHuman(512)).toBe('512.00 B')
    expect(bytesToHuman(1023)).toBe('1023.00 B')
  })

  it('handles kilobytes', () => {
    expect(bytesToHuman(1024)).toBe('1.00 KB')
    expect(bytesToHuman(1536)).toBe('1.50 KB')
    expect(bytesToHuman(2048)).toBe('2.00 KB')
  })

  it('handles megabytes', () => {
    expect(bytesToHuman(1048576)).toBe('1.00 MB')
    expect(bytesToHuman(1572864)).toBe('1.50 MB')
    expect(bytesToHuman(52428800)).toBe('50.00 MB')
  })

  it('handles gigabytes', () => {
    expect(bytesToHuman(1073741824)).toBe('1.00 GB')
    expect(bytesToHuman(1610612736)).toBe('1.50 GB')
  })

  it('handles terabytes', () => {
    expect(bytesToHuman(1099511627776)).toBe('1.00 TB')
  })

  it('handles petabytes', () => {
    expect(bytesToHuman(1125899906842624)).toBe('1.00 PB')
  })

  it('rounds to 2 decimal places', () => {
    expect(bytesToHuman(1500)).toBe('1.46 KB')
    expect(bytesToHuman(1000000)).toBe('976.56 KB')
  })
})