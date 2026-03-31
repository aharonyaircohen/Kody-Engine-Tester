# Verify fix: Review-fix loop with max iterations

## Context
kody-engine-lite v0.1.82 added a proper review-fix loop with up to 2 iterations.

Previously, after review-fix, the code re-ran review once but never re-ran review-fix again. If the first fix was insufficient, the pipeline silently shipped partially-fixed code.

Now the loop runs: review → fix → review → fix → review (max 2 fix attempts). If the review still fails after 2 fix iterations, it logs a warning and returns the result (allowing the pipeline to complete with the best-effort fix rather than hard-failing).

## Verification
Run a task that will trigger the review stage. The pipeline logs should show the new iteration-based review flow.

## Task
Add a `debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T` function to `src/lib/utils.ts`. Include a unit test using fake timers.