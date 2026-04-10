# [run-20260410-0144] T12: Rerun from specific stage test

## Task
Add a `debounce` utility function in `src/utils/debounce.ts` that debounces function calls.

## Requirements
- `debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T`
- Returns a debounced version of the function
- Add tests in `src/utils/debounce.test.ts`

## Note
This tests @kody rerun --from <stage> command.

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1262-260410-022141` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24223129165))

To rerun: `@kody rerun 1262-260410-022141 --from <stage>`

