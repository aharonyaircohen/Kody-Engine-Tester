
### taskify (2026-04-17T23:22:19)
I've completed the classification analysis. The task is a straightforward low-risk feature request to add a `formatDate` utility function with JSDoc and vitest tests, following the existing `src/utils/` pattern. No clarification questions needed — the task description is complete.

The plan is ready for your approval to exit plan mode and proceed.

### build (2026-04-17T23:23:17)
The plan is ready for review. Here's a summary of what I found and planned:

**Exploration findings:**
- `src/utils/format-date.ts` uses a complex `FormatDateOptions` object — the new `dateUtils.ts` is intentionally simpler: `formatDate(date: Date, locale: string): string` directly wrapping `Intl.DateTimeFormat`
- `src/utils/format-date.test.ts` follows vitest structure with `describe/it/expect`, `vi.useFakeTimers()` / `vi.useRealTimers()`, and frozen time via `vi.setSystemTime()` — this pattern
...(truncated)
