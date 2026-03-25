import { describe, it, expect } from 'vitest'
import { clamp } from './clamp'

describe('clamp', () => {
  it('should return value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('should return min when value is below min', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('should return max when value is above max', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('should return min when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0)
  })

  it('should return max when value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10)
  })

  it('should handle negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5)
    expect(clamp(-15, -10, -1)).toBe(-10)
    expect(clamp(0, -10, -1)).toBe(-1)
  })

  it('should handle min equal to max (single-point range)', () => {
    expect(clamp(5, 3, 3)).toBe(3)
    expect(clamp(3, 3, 3)).toBe(3)
  })

  it('should handle decimal values', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5)
    expect(clamp(1.5, 0, 1)).toBe(1)
    expect(clamp(-0.5, 0, 1)).toBe(0)
  })
})
