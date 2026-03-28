import { describe, it, expect } from 'vitest'
import { computeWeightedGrade, GradeCategory } from './gradebook'

// ─── Test helpers ─────────────────────────────────────────────────────────────

function category(name: string, weight: number, scores: { score: number; maxScore?: number }[]): GradeCategory {
  return { name, weight, scores }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('computeWeightedGrade', () => {
  it('calculates weighted average correctly', () => {
    const categories: GradeCategory[] = [
      category('Quiz', 40, [{ score: 80, maxScore: 100 }]),
      category('Assignment', 60, [{ score: 90, maxScore: 100 }]),
    ]
    const result = computeWeightedGrade(categories)
    // (80*40 + 90*60) / 100 = (3200 + 5400) / 100 = 86
    expect(result.grade).toBe(86)
    expect(result.breakdown).toHaveLength(2)
  })

  it('excludes zero-weight categories from calculation', () => {
    const categories: GradeCategory[] = [
      category('Quiz', 40, [{ score: 80, maxScore: 100 }]),
      category('Assignment', 60, [{ score: 90, maxScore: 100 }]),
      category('Extra Credit', 0, [{ score: 100, maxScore: 100 }]),
    ]
    const result = computeWeightedGrade(categories)
    // Extra credit should be ignored: (80*40 + 90*60) / 100 = 86
    expect(result.grade).toBe(86)
    expect(result.breakdown).toHaveLength(2)
    expect(result.breakdown.find((b) => b.category === 'Extra Credit')).toBeUndefined()
  })

  it('handles zero-weight category with no scores', () => {
    const categories: GradeCategory[] = [
      category('Quiz', 40, [{ score: 80, maxScore: 100 }]),
      category('Assignment', 60, [{ score: 90, maxScore: 100 }]),
      category('Extra Credit', 0, []),
    ]
    const result = computeWeightedGrade(categories)
    // Extra credit with no scores should not cause division by zero
    expect(result.grade).toBe(86)
    expect(result.breakdown).toHaveLength(2)
  })

  it('returns null when all categories have zero weight', () => {
    const categories: GradeCategory[] = [
      category('Extra Credit 1', 0, [{ score: 100, maxScore: 100 }]),
      category('Extra Credit 2', 0, []),
    ]
    const result = computeWeightedGrade(categories)
    expect(result.grade).toBeNull()
    expect(result.breakdown).toHaveLength(0)
  })

  it('returns null when categories array is empty', () => {
    const result = computeWeightedGrade([])
    expect(result.grade).toBeNull()
    expect(result.breakdown).toHaveLength(0)
  })

  it('handles empty scores array for valid categories', () => {
    const categories: GradeCategory[] = [
      category('Quiz', 40, [{ score: 80, maxScore: 100 }]),
      category('Assignment', 60, []),
    ]
    const result = computeWeightedGrade(categories)
    // Assignment with no scores contributes 0: (80*40 + 0*60) / 100 = 32
    expect(result.grade).toBe(32)
    expect(result.breakdown).toHaveLength(2)
    expect(result.breakdown.find((b) => b.category === 'Assignment')?.contribution).toBe(0)
  })

  it('calculates correctly with multiple scores per category', () => {
    const categories: GradeCategory[] = [
      category('Quiz', 40, [
        { score: 80, maxScore: 100 },
        { score: 90, maxScore: 100 },
      ]),
      category('Assignment', 60, [
        { score: 85, maxScore: 100 },
        { score: 95, maxScore: 100 },
      ]),
    ]
    const result = computeWeightedGrade(categories)
    // Quiz avg: 85, Assignment avg: 90
    // (85*40 + 90*60) / 100 = (3400 + 5400) / 100 = 88
    expect(result.grade).toBe(88)
  })

  it('uses score as percentage when maxScore is not provided', () => {
    const categories: GradeCategory[] = [
      category('Quiz', 50, [{ score: 85 }]),
      category('Assignment', 50, [{ score: 95 }]),
    ]
    const result = computeWeightedGrade(categories)
    // Both treated as percentages: (85*50 + 95*50) / 100 = 90
    expect(result.grade).toBe(90)
  })

  it('calculates correctly with mixed maxScores', () => {
    const categories: GradeCategory[] = [
      category('Quiz', 40, [{ score: 80, maxScore: 100 }]), // 80%
      category('Assignment', 60, [{ score: 45, maxScore: 50 }]), // 90%
    ]
    const result = computeWeightedGrade(categories)
    // (80*40 + 90*60) / 100 = (3200 + 5400) / 100 = 86
    expect(result.grade).toBe(86)
  })
})
