
### build (2026-04-05T06:29:36)
The lint errors shown are all pre-existing issues in other files - none are related to the `base64.ts` changes I made.

**Summary of changes to `src/utils/base64.ts`:**

1. **Added JSDoc with correct `@throws TypeError`** - Updated the JSDoc comments for `encode` and `decode` to properly document that they throw `TypeError` on invalid input (not just `Error`)

2. **Added empty string input validation** - Both `encode` and `decode` now return `''` for empty/null inputs instead of potentially thro
...(truncated)
