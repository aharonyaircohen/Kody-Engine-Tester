# [run-20260411-2048] T03: Refactor auth system with migration

## Task
Redesign the entire authentication system: replace session-based auth with JWT, migrate the user schema to add a `roles` array field, add RBAC with admin/editor/viewer roles, and update all API routes to use the new auth model.

## Details
- Replace session-store with jwt-service
- Update user-store schema to include roles
- Create rbac.ts middleware for role checking
- Update all routes in src/auth/ to use JWT
- Ensure backward compatibility during migration period

## Acceptance Criteria
- [ ] JWT-based authentication replaces sessions
- [ ] User schema includes roles array
- [ ] RBAC middleware enforces admin/editor/viewer
- [ ] All existing auth routes updated
- [ ] Migration maintains backward compatibility

---

## Discussion (34 comments)

*Showing first 5 and last 10 of 34 comments*

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `2000-260411-175024` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24288124085))

To rerun: `@kody rerun 2000-260411-175024 --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24288124085))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24288157372))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24288124085)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24288157372))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24288190471))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24288157372)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24288190471))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24288226969))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24288190471)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24288851920))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24288890904))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24288851920)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24288890904))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24288929661))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24288890904)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `2000-260411-190910` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24289517856))

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `2000-260411-195058` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24290262880))

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `2000-260411-201147` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24290638571))

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `2000-retest` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24291310176))

