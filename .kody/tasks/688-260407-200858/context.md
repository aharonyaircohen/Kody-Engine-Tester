
### taskify (2026-04-07T20:12:23)
All 8 tests pass.

{"task_type":"feature","title":"Add debounce utility in timing-helpers.ts","description":"Create debounce function in src/utils/timing-helpers.ts with the signature debounce<T extends (...args: any[]) => void>(fn: T, delayMs: number): T. Includes 8 tests covering: delayed execution, single execution on multiple calls, last-argument capture, multiple arguments, re-execution after delay, this context preservation, async function support, and zero-delay behavior.","scope":["src/u
...(truncated)

### build (2026-04-07T20:14:05)
All 8 tests pass. The debounce utility task is complete:

**Implementation** (`src/utils/timing-helpers.ts`):
- Generic `debounce<T extends (...args: any[]) => void>(fn: T, delayMs: number): T`
- Properly clears previous timeout on each call
- Preserves `this` context via `fn.apply`
- Returns the debounced function with proper type signature

**Tests** (`src/utils/timing-helpers.test.ts`) - 8 passing:
- Delays execution until after delay
- Only executes once when called multiple times within del
...(truncated)
