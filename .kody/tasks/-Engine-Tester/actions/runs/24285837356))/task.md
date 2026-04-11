# [run-20260411-1526] T04: Dry run validation

## Task
Add a `parse-json-safe` utility in `src/utils/parse-json-safe.ts` that safely parses JSON strings, returning null instead of throwing on invalid JSON.

```typescript
export function parseJsonSafe<T = unknown>(str: string): T | null
```

This is a simple utility function to test the dry-run mode. No actual files should be created in dry-run mode.

## Acceptance Criteria
- In dry-run: pipeline completes but no PR created
- In actual run: function implemented with tests

---

## Discussion (13 comments)

**@aharonyaircohen** (2026-04-11):
@kody full --dry-run

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1872-260411-152720` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285570676))

To rerun: `@kody rerun 1872-260411-152720 --from <stage>`

**@aharonyaircohen** (2026-04-11):
❌ Pipeline crashed: ENOENT: no such file or directory, open '/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/.kody/tasks/1872-260411-152720/.lock'

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/Kody-Engine-Tester/.kody/tasks/1872-260411-152720/.lock'` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285605689))

To rerun: `@kody rerun -Engine-Tester/Kody-Engine-Tester/.kody/tasks/1872-260411-152720/.lock' --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/.kody/tasks/1872-260411-152720/.lock'`` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285639350))

To rerun: `@kody rerun -Engine-Tester/.kody/tasks/1872-260411-152720/.lock'` --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285639350))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285677984))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285639350)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285677984))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285706088))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285677984)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
❌ Pipeline crashed: ENOENT: no such file or directory, open '/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/.kody/tasks/-Engine-Tester/actions/runs/24285677984))/.lock'

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/Kody-Engine-Tester/.kody/tasks/-Engine-Tester/actions/runs/24285677984))/.lock'` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285750181))

To rerun: `@kody rerun -Engine-Tester/Kody-Engine-Tester/.kody/tasks/-Engine-Tester/actions/runs/24285677984))/.lock' --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/.kody/tasks/-Engine-Tester/actions/runs/24285677984))/.lock'`` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285783483))

To rerun: `@kody rerun -Engine-Tester/.kody/tasks/-Engine-Tester/actions/runs/24285677984))/.lock'` --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285783483))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285811577))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285783483)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285811577))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285837356))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285811577)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285837356))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285865011))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285837356)) --from <stage>`

