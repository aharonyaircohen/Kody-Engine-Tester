# [run-20260411-1526] T01: Simple utility function

## Task
Add a `truncateOnce` utility function in `src/utils/truncate-once.ts`.

The function should truncate a string to a maximum length, appending '...' if truncated. Unlike a normal truncate, it should only truncate once (never shorten an already truncated string further). The function signature:

```typescript
export function truncateOnce(str: string, maxLength: number): string
```

## Acceptance Criteria
- Truncates strings longer than maxLength to maxLength-3 characters + '...'
- Returns unchanged strings that are <= maxLength
- Returns '...' for any string when maxLength < 3
- Unit tests in `src/utils/truncate-once.test.ts`

---

## Discussion (10 comments)

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1869-260411-152713` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285569283))

To rerun: `@kody rerun 1869-260411-152713 --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285569283))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285600640))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285569283)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285600640))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285638743))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285600640)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285638743))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285673464))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285638743)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285673464))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285700836))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285673464)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285700836))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285738932))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285700836)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285738932))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285764108))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285738932)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285764108))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285801957))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285764108)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285801957))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285842753))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285801957)) --from <stage>`

