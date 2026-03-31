
### taskify (2026-03-31T16:07:11)
Done. Created:

- `src/utils/clamp.ts` - utility function that constrains a number between min and max
- `src/utils/clamp.test.ts` - 6 test cases covering: value in range, below min, above max, equal min/max, negative ranges, and decimal values

All 1433 tests pass.


### build (2026-03-31T16:09:29)
**Implementation complete.** 

**Summary:**
- `src/utils/clamp.ts` - Uses `Math.min(Math.max(value, min), max)` pattern
- `src/utils/clamp.test.ts` - 6 test cases covering all required scenarios

**Test results:** All 1433 tests pass (1 skipped pre-existing).

**TypeScript:** The clamp files have no errors. Pre-existing errors in other files (`Assignments.ts`, `auth-context.test.tsx`, `event-emitter.ts`, `pipe.test.ts`) are unrelated to this implementation.

