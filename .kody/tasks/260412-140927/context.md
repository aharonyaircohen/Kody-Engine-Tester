
### taskify (2026-04-12T11:09:53)
{"task_type":"feature","title":"Add add function to math.ts","description":"Add a simple add function to src/utils/math.ts that returns the sum of two numbers. Should follow existing utility function patterns with co-located tests.","scope":["src/utils/math.ts","src/utils/math.test.ts"],"risk_level":"low","existing_patterns":["src/utils/math.ts - single-function utility file with isOdd as example pattern","src/utils/math.test.ts - vitest describe/it structure with comprehensive test cases"],"que
...(truncated)

### build (2026-04-12T11:11:00)
Done. Added `add` function to `math.ts` and tests to `math.test.ts`:

**math.ts** - Added:
```typescript
export function add(a: number, b: number): number {
  return a + b
}
```

**math.test.ts** - Added 4 test cases for `add`:
- Positive numbers: `add(1, 2) === 3`
- Negative numbers: `add(-1, -2) === -3`
- Mixed: `add(-1, 2) === 1`
- Zero: `add(5, 0) === 5`

All 9 tests pass (5 existing for `isOdd` + 4 new for `add`).

