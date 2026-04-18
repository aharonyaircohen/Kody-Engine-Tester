# Plan: Verify & Fix Notification System Implementation

## Context

This is a meta-verification task (P1T25) for the Kody Engine's `@kody decompose` feature. The task decomposes a complex 5-area notification system implementation into parallel sub-tasks. The build stage ran successfully and created the notification system files. This plan addresses what the **build** stage must do: verify all files exist and fix any issues.

## Verification Results

All 5 areas are fully implemented:

| Area | File | Status |
|------|------|--------|
| Domain model | `src/models/notification.ts` | ✅ Exists |
| Service layer | `src/services/notifications.ts` | ✅ Exists |
| Route handlers | `src/routes/notifications.ts` | ✅ Exists |
| Utility helpers | `src/utils/notificationHelpers.ts` | ✅ Exists |
| Tests | `src/utils/notificationHelpers.test.ts` | ✅ 17 tests passing |
| Tests | `src/services/notifications.test.ts` | ✅ 8 tests passing |
| Payload collection | `src/collections/Notifications.ts` | ✅ Exists |
| API GET route | `src/app/api/notifications/route.ts` | ✅ Exists |
| API PATCH route | `src/app/api/notifications/[id]/read/route.ts` | ✅ Exists |
| API POST route | `src/app/api/notifications/read-all/route.ts` | ✅ Exists |

**TypeScript**: ✅ No new errors (2 pre-existing unrelated errors in `src/utils/bad-types.ts` and `tests/helpers/seedUser.ts`)
**ESLint**: ✅ No errors, 9 warnings (8x `any` in notifications.ts, 1x unused `user` in route)
**Vitest**: ✅ 127 test files pass (1782 tests), 1 pre-existing DB failure unrelated to notifications

## Issues to Fix

### 1. ESLint: Unused `user` parameter in PATCH route
**File**: `src/app/api/notifications/[id]/read/route.ts:9`

```typescript
// Current (warning: 'user' is defined but never used):
export const PATCH = withAuth(
  async (
    request: NextRequest,
    { user },  // ← unused
    routeParams?: { params: Promise<{ id: string }> },
  ) => {
```

Fix: rename `user` → `_user` to satisfy ESLint rule `no-unused-vars` with `_` prefix allowance.

### 2. FIXME: Bulk notifications sent one-by-one
**File**: `src/services/notifications.ts:7`

The `notify()` method creates one Payload doc per call. When sending bulk notifications to many users, this should use `Promise.all()` or Payload's bulk create. Fix by adding a `notifyBulk()` method that calls `Promise.all()` over an array of notifications.

### 3. ESLint: `any` type assertions in service
**File**: `src/services/notifications.ts` (8 occurrences)

Payload SDK requires `as any` for the `collection` key due to dynamic slug typing. These are acceptable per codebase conventions (same pattern used in other services), but can be suppressed inline with `// eslint-disable-next-line` to keep warnings from blocking CI if the project has strict linting.

## Implementation Plan

1. **[Fix]** Rename unused `user` → `_user` in `src/app/api/notifications/[id]/read/route.ts:9`
2. **[Enhancement]** Add `notifyBulk()` method to `src/services/notifications.ts` that uses `Promise.all()` for batch sends
3. **[Suppression]** Add ESLint disable comments for the 8 `any` types in `notifications.ts`
4. **[Verify]** Re-run `pnpm eslint` and `pnpm test:int` to confirm all pass

## Verification

```bash
# Run tests
pnpm test:int
# Expected: 127 passed, 1 failed (pre-existing), 1782 tests pass

# Run linting
pnpm eslint src/services/notifications.ts src/app/api/notifications/\[id\]/read/route.ts
# Expected: 0 errors, 0 warnings
```

## Files to Modify

- `src/app/api/notifications/[id]/read/route.ts` — rename `user` → `_user`
- `src/services/notifications.ts` — add `notifyBulk()`, add ESLint disable comments
