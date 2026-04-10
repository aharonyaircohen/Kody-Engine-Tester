
### taskify (2026-04-10T11:35:55)
The file `src/utils/bad-types.ts` already exists with the correct implementation. The task was completed in a prior run.

{
"task_type": "chore",
"title": "Verify existing implementation of bad-types.ts",
"description": "File src/utils/bad-types.ts already exists with `function getCount(): string { return 42 }` which intentionally returns a number when a string is declared — this will fail TypeScript type checking as intended by the task.",
"scope": ["src/utils/bad-types.ts"],
"risk_level": "low
...(truncated)

### build (2026-04-10T11:36:15)
**Verified:** `src/utils/bad-types.ts` exists with the intentional type error: `getCount()` declares return type `string` but returns the number `42`. This will fail `pnpm tsc --noEmit` as expected.

The task implementation matches the requirements. No changes needed.

