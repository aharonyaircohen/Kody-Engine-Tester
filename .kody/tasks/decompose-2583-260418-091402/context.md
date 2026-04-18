
### taskify (2026-04-18T09:17:13)
The taskify classification is ready. The task is a **low-risk, single-file feature** to add a `capitalize` utility following the established `src/utils/` pattern (single-function file + co-located `.test.ts` with vitest). No questions remain — the scope is clear and no further clarification is needed.

### build (2026-04-18T09:18:25)
The plan is ready for your review. It covers:
- **`capitalize.ts`** — capitalizes only the first character of a string (distinct from `capitalizeWords` which capitalizes every word)
- **`capitalize.test.ts`** — 8 vitest test cases covering all edge cases, following the exact pattern used by `capitalize-words.test.ts`, `to-kebab-case.test.ts`, etc.

**Verification steps:** `pnpm test:int src/utils/capitalize.test.ts` + `pnpm tsc --noEmit`.
