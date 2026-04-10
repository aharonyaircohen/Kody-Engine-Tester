
### taskify (2026-04-10T21:02:25)
{"task_type":"refactor","title":"Add event hooks to auth service","description":"Add event emission to AuthService for login, logout, and token refresh events. The JWT auth with refresh token rotation is already implemented; this task adds event hooks to allow external systems to subscribe to auth lifecycle events (login, logout, token refresh, token refresh rotation). Should emit events with user context and metadata (IP, user agent, timestamp).","scope":["src/auth/auth-service.ts","src/auth/au
...(truncated)

### plan (2026-04-10T21:03:17)
## Existing Patterns Found

- `src/utils/event-emitter.ts` - `EventEmitter` class with `on`/`once`/`off`/`emit` pattern, already has typed event map support — reused for auth events
- `src/auth/auth-service.ts` - existing service with `login`, `refresh`, `verifyAccessToken`, `logout` methods that need to emit events; uses `createError` helper for typed errors
- `src/auth/auth-service.test.ts` - existing test patterns with `vi.fn()` mocks, `mockPayload` SDK stub, real JWT service instantiation

#
...(truncated)

### build (2026-04-10T21:05:50)
Implementation complete. Summary of changes:

**Step 1: Created `src/auth/auth-events.ts`**
- Defined `LoginEvent`, `LogoutEvent`, `TokenRefreshEvent` interfaces
- Typed `AuthEvents` event map for type-safe event emission
- Exported `createAuthEventEmitter()` factory function

**Step 2: Updated `src/auth/auth-service.ts`**
- Added optional `eventEmitter?: EventEmitter<AuthEvents>` parameter to constructor
- Added `login` event emission after successful authentication (line 143)
- Added `tokenRef
...(truncated)
