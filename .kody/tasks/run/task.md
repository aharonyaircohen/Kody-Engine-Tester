# Verify fix: No duplicate PR comments on review

## Context
kody-engine-lite v0.1.82 removed duplicate PR commenting during `@kody review`.

Previously, the engine called both `postPRComment()` AND `submitPRReview()` with the same body, resulting in two identical comments on the PR. Now only `submitPRReview()` is called, which posts a single review with the body.

## Verification
Run `@kody review` on a PR and confirm:
1. Only ONE review comment appears (not two identical ones)
2. The PR review status is correctly set (approve or request-changes)

## Task
Add a `capitalizeWords(str: string): string` function to `src/lib/utils.ts` that capitalizes the first letter of each word. Include a unit test.