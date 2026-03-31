import { describe, it, expect } from 'vitest'
import { clamp } from './clamp'

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('returns min when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('returns max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('handles equal min and max', () => {
    expect(clamp(5, 10, 10)).toBe(10)
    expect(clamp(10, 10, 10)).toBe(10)
    expect(clamp(15, 10, 10)).toBe(10)
  })

  it('handles negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5)
    expect(clamp(-15, -10, -1)).toBe(-10)
    expect(clamp(5, -10, -1)).toBe(-1)
  })

  it('handles decimal values', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5)
    expect(clamp(-0.5, 0, 1)).toBe(0)
    expect(clamp(1.5, 0, 1)).toBe(1)
  })
})
