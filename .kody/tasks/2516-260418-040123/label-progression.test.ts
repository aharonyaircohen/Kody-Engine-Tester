import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ---------------------------------------------------------------------------
// Lifecycle label mapping — stage name → GitHub label applied by kody pipeline
// ---------------------------------------------------------------------------
const STAGE_LABELS: Record<string, string> = {
  plan: 'kody:planning',
  build: 'kody:building',
  verify: 'kody:verifying',
  review: 'kody:review',
  'review-fix': 'kody:review',
  ship: 'kody:done',
}

// Stages that have not yet been reached — no future label should be present
const FUTURE_STAGES = new Set(['verify', 'review', 'review-fix', 'ship'])

// Stages that have completed and whose label should have been replaced
const PAST_STAGES = new Set(['plan', 'build', 'verify', 'review-fix'])

// Complexity labels that may persist across all stages
const COMPLEXITY_LABELS = new Set([
  'kody:low',
  'kody:medium',
  'kody:high',
  'kody:feature',
  'kody:bug',
  'kody:chore',
])

// Non-lifecycle labels that are allowed to coexist with lifecycle labels
const ISSUE_NUMBER = '2516'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface StatusJson {
  stages: Record<string, { state: string }>
}

function getCurrentStage(): string {
  const statusPath = resolve(__dirname, 'status.json')
  const content = readFileSync(statusPath, 'utf-8')
  const status: StatusJson = JSON.parse(content)

  for (const [stage, meta] of Object.entries(status.stages)) {
    if (meta.state === 'running') {
      return stage
    }
  }

  // Fallback: return the last completed stage if no stage is running
  let lastCompleted = 'taskify'
  for (const [stage, meta] of Object.entries(status.stages)) {
    if (meta.state === 'completed' && stage !== 'taskify') {
      lastCompleted = stage
    }
  }
  return lastCompleted
}

function getGitHubLabels(): string[] {
  const raw = execSync(
    `gh issue view ${ISSUE_NUMBER} --json labels --jq '.labels[].name'`,
    { encoding: 'utf-8' }
  )
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Lifecycle Label Progression', () => {
  it('applies correct stage label and persists complexity label', () => {
    const stage = getCurrentStage()
    const labels = getGitHubLabels()

    // 1. Complexity label must be present
    const hasComplexity = labels.some((l) => COMPLEXITY_LABELS.has(l))
    expect(hasComplexity, `Expected a complexity label (kody:low|medium|high|feature|bug|chore) in ${JSON.stringify(labels)}`).toBe(true)

    // 2. If current stage has a lifecycle label, it must be present
    const expectedLabel = STAGE_LABELS[stage]
    if (expectedLabel) {
      expect(labels, `Expected label "${expectedLabel}" for stage "${stage}" but got ${JSON.stringify(labels)}`).toContain(expectedLabel)
    }

    // 3. No future-stage lifecycle labels should be present
    //    (skip stages whose label equals the current stage's label, e.g. "review" and "review-fix" both use "kody:review")
    for (const future of FUTURE_STAGES) {
      const futureLabel = STAGE_LABELS[future]
      if (!futureLabel) continue
      if (futureLabel === expectedLabel) continue // same label as current stage — no conflict
      expect(labels, `Future-stage label "${futureLabel}" should not be present during stage "${stage}"`).not.toContain(futureLabel)
    }

    // 4. No past-stage lifecycle labels should be present (each stage replaces the previous)
    for (const past of PAST_STAGES) {
      const pastLabel = STAGE_LABELS[past]
      if (!pastLabel) continue
      if (pastLabel === expectedLabel) continue // same label as current stage — no conflict
      expect(labels, `Past-stage label "${pastLabel}" should have been removed after stage "${past}"`).not.toContain(pastLabel)
    }
  })
})
