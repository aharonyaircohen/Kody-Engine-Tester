import { describe, expect, it } from 'vitest'
import summarize from './summarize'

describe('summarize', () => {
  it('empty array → all null except count: 0', () => {
    const result = summarize([])
    expect(result.count).toBe(0)
    expect(result.mean).toBeNull()
    expect(result.median).toBeNull()
    expect(result.mode).toBeNull()
    expect(result.stdDev).toBeNull()
  })

  it('single element [7] → mean=median=mode=7, stdDev=null, count=1', () => {
    const result = summarize([7])
    expect(result.mean).toBe(7)
    expect(result.median).toBe(7)
    expect(result.mode).toBe(7)
    expect(result.stdDev).toBeNull()
    expect(result.count).toBe(1)
  })

  it('two elements [1, 3] → mean=2, median=2, mode=null, stdDev=1', () => {
    const result = summarize([1, 3])
    expect(result.mean).toBe(2)
    expect(result.median).toBe(2)
    expect(result.mode).toBeNull()
    expect(result.stdDev).toBe(1)
    expect(result.count).toBe(2)
  })

  it('uniform [5,5,5] → mode=5', () => {
    const result = summarize([5, 5, 5])
    expect(result.mode).toBe(5)
    expect(result.mean).toBe(5)
    expect(result.median).toBe(5)
  })

  it('mode tie [1,2,2,1] → mode=1 (smallest wins)', () => {
    const result = summarize([1, 2, 2, 1])
    expect(result.mode).toBe(1)
  })

  it('negative numbers [-3,-1,-2] → correct mean=-2, median=-2, mode=null', () => {
    const result = summarize([-3, -1, -2])
    expect(result.mean).toBe(-2)
    expect(result.median).toBe(-2)
    expect(result.mode).toBeNull()
  })

  it('floating point [0.1, 0.2, 0.3] → mean ≈ 0.2', () => {
    const result = summarize([0.1, 0.2, 0.3])
    expect(result.mean).toBeCloseTo(0.2, 10)
  })

  it('even-count [1,2,3,4] → median=2.5', () => {
    const result = summarize([1, 2, 3, 4])
    expect(result.median).toBe(2.5)
  })

  it('known stdDev [2,4,4,4,5,5,7] → population stdDev ≈ 1.40', () => {
    const result = summarize([2, 4, 4, 4, 5, 5, 7])
    expect(result.stdDev).toBeCloseTo(1.4, 1)
  })
})
