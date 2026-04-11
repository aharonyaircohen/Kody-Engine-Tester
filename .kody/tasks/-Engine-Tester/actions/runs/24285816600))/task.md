# [run-20260411-1526] T02: Add middleware with tests

## Task
Add a `content-type-guard` middleware in `src/middleware/content-type-guard.ts`.

This middleware ensures that requests with a body have a Content-Type header that matches application/json or multipart/form-data. Requests with bodies missing the proper Content-Type should be rejected with a 400 error.

## Acceptance Criteria
- Rejects requests with a body but no Content-Type header (400)
- Allows requests without a body regardless of Content-Type
- Allows requests with body and valid Content-Type
- Unit tests in `src/middleware/content-type-guard.test.ts`

---

## Discussion (11 comments)

**@aharonyaircohen** (2026-04-11):
@kody full

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1870-260411-152720` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285570296))

To rerun: `@kody rerun 1870-260411-152720 --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285570296))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285602552))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285570296)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285602552))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285628009))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285602552)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285628009))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285666908))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285628009)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285666908))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285704260))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285666908)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285704260))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285735606))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285704260)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285735606))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285765712))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285735606)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285765712))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285790621))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285765712)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285790621))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285816600))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285790621)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24285816600))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285854179))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24285816600)) --from <stage>`

