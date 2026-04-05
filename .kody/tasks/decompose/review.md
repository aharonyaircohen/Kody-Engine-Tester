## Verdict: FAIL

## Summary

The diff has been partially revised — PATCH now verifies notification ownership before marking read (resolving the authorization issue from the previous review). However, `src/routes/notifications.ts` remains placed outside the Next.js App Router at `src/routes/notifications.ts`, making it unreachable dead code. The POST handler also still lacks proper `NotificationType` enum validation.

## Findings

### Critical

- **`src/routes/notifications.ts:1-124`** — This file at `src/routes/notifications.ts` is not a Next.js App Router route and cannot be reached by HTTP requests. Next.js App Router only recognizes routes in `src/app/`. The existing notification routes live at `src/app/api/notifications/`. No file imports from `@/routes/notifications` (`grep` confirms zero references). This is unreachable dead code.

### Major

- **`src/routes/notifications.ts:56`** — POST handler accepts `type: NotificationType` from request body with only a truthy check (`!type`). If a client submits an invalid `type` value not in the `NotificationType` union, it passes through to `service.notify()` and gets written to Payload without validation. Should use a type guard or Zod schema to validate the value is a valid `NotificationType` before the service call.

### Minor

- **`src/routes/notifications.ts:107-117`** — After the ownership check passes and `service.markRead(id)` is called, the returned `updated` notification is shadowed by a new variable but the original `notification` from `payload.findByID` is also returned in the response. The response is `{ notification: updated }` which is correct — the shadowing is fine since the old `notification` variable is no longer needed. No issue here.

## Two-Pass Review

**Pass 1 — CRITICAL:**

### Route Architecture
- `src/routes/notifications.ts` — Plain module at `src/routes/notifications.ts` exports `GET`/`POST`/`PATCH`. This is not in `src/app/api/` so it is not an App Router route. No consumer imports it. Dead code.

### Authorization
- PATCH handler (lines 107-117) now correctly fetches the notification and verifies `(notification as any).recipient !== user.id` before marking read. Returns 403 if not owner. This is fixed from the previous review.

### Enum & Value Completeness
- `NotificationSeverity = 'info' | 'warning' | 'error'` — New type system, not consumed anywhere outside the diff. No allowlists, switch statements, or filter arrays reference it. Purely additive.
- `NotificationType` in POST handler uses truthy check only — invalid enum values are not rejected.

**Pass 2 — INFORMATIONAL:**

### Test Coverage
- `notificationHelpers.test.ts` has good coverage. No integration tests for routes.
- No test for POST with invalid `type` value.
- No test for PATCH with non-owned notification ID.

### Dead Code
- `src/routes/notifications.ts` — unreachable. `GET`, `POST`, `PATCH` are exported but no consumer imports them.

### Type Safety
- `src/routes/notifications.ts:107` — `(notification as any).recipient` uses `as any` cast. The Payload return type is untyped, so an explicit cast is needed, but `as any` bypasses TypeScript's type checking. A more targeted cast like `(notification as { recipient: string | number }).recipient` would be safer.
