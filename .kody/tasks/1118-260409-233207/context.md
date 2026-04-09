
### taskify (2026-04-09T23:35:23)
Created `src/utils/timing-helpers.ts` with the `debounce` utility and `src/utils/timing-helpers.test.ts` with 6 tests. All tests pass.


### build (2026-04-09T23:35:51)
All 6 tests pass. The implementation is complete and verified:

**`src/utils/timing-helpers.ts`** - Generic `debounce<T extends (...args: any[]) => void>` that:
- Clears previous timeout on each call (leading-edge debounce)
- Preserves `this` context via `fn.apply(this, args)`
- Returns the debounced function cast to type `T`

**`src/utils/timing-helpers.test.ts`** - 6 tests covering:
- Delayed execution
- Multiple calls within delay (executes once)
- Last arguments used
- Multiple arguments
- R
...(truncated)
