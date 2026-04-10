
### taskify (2026-04-10T04:38:35)

{
  "task_type": "feature",
  "title": "Add sanitizeInput function to src/middleware/sanitize.ts",
  "description": "Create a `sanitizeInput(input: string): string` function in `src/middleware/sanitize.ts` that strips HTML tags, trims whitespace, and normalizes unicode. Include co-located tests in `sanitize.test.ts`. Reuse unicode normalization pattern from `src/utils/slugify.ts` (NFD normalization + diacritic removal) and HTML stripping pattern from `src/security/sanitizers.ts`.",
  "scope": [
...(truncated)

### build (2026-04-10T04:43:38)
The lint errors are all pre-existing in the codebase. My new files have no lint issues.

**Summary of implementation:**

Created two files as requested:

1. **`src/middleware/sanitize.ts`** - `sanitizeInput(input: string): string` function that:
   - Removes null bytes and strips HTML tags (including script tag content for XSS prevention)
   - Normalizes unicode using NFD + diacritic removal (reusing pattern from `slugify.ts`)
   - Trims whitespace

2. **`src/middleware/sanitize.test.ts`** - 10 
...(truncated)
