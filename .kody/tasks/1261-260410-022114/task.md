# [run-20260410-0144] T11: Flag feedback injection test

## Task
Add a `group-by` utility function in `src/utils/group-by.ts` that groups array elements by a key.

## Requirements
- `groupBy<T>(array: T[], key: keyof T | ((item: T) => string | number)): Record<string, T[]>`
- Works with both property keys and callback functions
- Add tests in `src/utils/group-by.test.ts`

## Note
This tests --feedback injection flag.

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody --feedback "Use functional style with pure functions"

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1261-260410-022114` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24223129150))

To rerun: `@kody rerun 1261-260410-022114 --from <stage>`

