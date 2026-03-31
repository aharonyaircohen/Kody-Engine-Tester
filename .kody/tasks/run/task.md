# Verify fix: Increased error truncation for better diagnosis

## Context
kody-engine-lite v0.1.82 increased error output truncation limits:
- Diagnosis agent: 2000 → 5000 chars (observer.ts)
- Agent runner stderr: 500 → 2000 chars (agent-runner.ts, config.ts)

Previously, TypeScript/ESLint errors were aggressively truncated, causing the failure diagnosis agent to misclassify errors due to missing context.

## Verification
This fix improves diagnosis quality on complex errors. Verify by running a task that will trigger the verify stage. The pipeline should complete without classification issues.

## Task
Add a `slugify(text: string): string` function to `src/lib/utils.ts` that converts text to a URL-friendly slug (lowercase, replace spaces with hyphens, remove special chars). Include a unit test.