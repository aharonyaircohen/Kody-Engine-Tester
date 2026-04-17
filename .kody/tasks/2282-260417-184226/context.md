
### taskify (2026-04-17T18:46:13)
Classification complete. The project is a fresh Payload CMS 3.0 blank template — no existing `src/` source files at all. The task requires:

- **`src/utils/dateUtils.ts`** — new file with `formatDate(date: Date, locale: string): string` using `Intl.DateTimeFormat`, with JSDoc
- **`src/utils/dateUtils.test.ts`** — new co-located vitest test file covering multiple locales and edge cases

Risk: **low** (2 new files, no existing code affected). No external dependencies needed — uses the built-in `In
...(truncated)

### build (2026-04-17T18:49:15)
The plan is ready. Here's a summary of what will be implemented:

---

## Plan Summary

**Task:** Create `formatDate(date: Date, locale: string): string` utility in `src/utils/dateUtils.ts` using `Intl.DateTimeFormat`, plus a co-located vitest test suite.

**Files to create:**
1. **`src/utils/dateUtils.ts`** — pure utility with JSDoc, using `Intl.DateTimeFormat`
2. **`src/utils/dateUtils.test.ts`** — vitest suite covering en-US, de-DE, fr-FR, ja-JP, en-GB, plus edge cases (epoch, far future, inv
...(truncated)
