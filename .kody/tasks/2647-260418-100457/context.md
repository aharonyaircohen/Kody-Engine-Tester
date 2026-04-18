
### taskify (2026-04-18T10:08:09)
Task classified as **feature / low risk**. The scope is `src/utils/dateUtils.ts` and `src/utils/dateUtils.test.ts`, reusing the established single-function utility pattern from `src/utils/`. No questions — requirements are clear and complete.

### build (2026-04-18T10:08:33)
The plan is ready for review. It covers:

- **`src/utils/dateUtils.ts`** — `formatDate` using `toLocaleDateString` with year/month/day options + JSDoc
- **`src/utils/dateUtils.test.ts`** — 4 vitest cases covering locale behavior, invalid input, and return type
- **Verification** — `pnpm tsc --noEmit` + `pnpm test:int`
