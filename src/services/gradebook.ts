// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScoreRecord {
  score: number
  maxScore?: number
}

export interface GradeCategory {
  name: string
  weight: number
  scores: ScoreRecord[]
}

/**
 * Result of gradebook aggregation.
 * `grade` is null when there are no valid categories to aggregate.
 */
export interface GradebookResult {
  grade: number | null
  breakdown: {
    category: string
    contribution: number
    weight: number
  }[]
}

// ─── Service ───────────────────────────────────────────────────────────────────

/**
 * Calculates a weighted average across grade categories.
 *
 * - Filters out categories with weight=0 (including those with no scores)
 * - Returns null when no valid categories remain
 * - Handles empty score arrays gracefully (no division by zero)
 */
export function computeWeightedGrade(categories: GradeCategory[]): GradebookResult {
  // Filter to only categories with positive weight
  const validCategories = categories.filter((cat) => cat.weight > 0)

  if (validCategories.length === 0) {
    return { grade: null, breakdown: [] }
  }

  let totalWeightedScore = 0
  let totalWeight = 0
  const breakdown: GradebookResult['breakdown'] = []

  for (const cat of validCategories) {
    if (cat.scores.length === 0) {
      // Category with no scores contributes 0 but still counts toward total weight
      breakdown.push({ category: cat.name, contribution: 0, weight: cat.weight })
      totalWeight += cat.weight
      continue
    }

    // Calculate average score for this category (as percentage)
    const sum = cat.scores.reduce((acc, s) => {
      const percentage = s.maxScore ? (s.score / s.maxScore) * 100 : s.score
      return acc + percentage
    }, 0)
    const categoryAverage = sum / cat.scores.length

    // Calculate contribution to weighted average
    const contribution = (categoryAverage * cat.weight) / 100
    totalWeightedScore += contribution
    totalWeight += cat.weight

    breakdown.push({ category: cat.name, contribution, weight: cat.weight })
  }

  // Guard against division by zero (shouldn't happen due to filtering, but defensive)
  if (totalWeight === 0) {
    return { grade: null, breakdown }
  }

  // Normalize by total weight to get percentage
  const grade = (totalWeightedScore / totalWeight) * 100

  return {
    grade: Math.round(grade),
    breakdown,
  }
}
