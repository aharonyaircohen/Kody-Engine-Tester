## Verdict: PASS

## Summary

The auth system refactor successfully replaces session-based auth with pure JWT tokens. Key changes: deleted `SessionStore` and `SessionCard`, added `roles` array field to Users collection with migration, created new RBAC middleware (`rbac.ts`), and updated `AuthService` with `getPrimaryRole()` helper for backwards compatibility.

## Findings

### Critical
None.

### Major
None.

### Minor

1. `src/pages/auth/profile.tsx:88` — Missing newline at end of file. Cosmetic only.

2. **Pre-existing build failure** — `src/pages/board/modal.tsx` has a TypeScript error (`Property 'default' is missing in type`) that is **not caused by this task**. The file was last modified in commit `c9f1a4e5c0ca66868d3115645ea25f16cd273060` (task #44, March 2026), predating this auth refactor. The auth-specific tests (207 tests across 15 files) all pass.

---

## Two-Pass Review

**Pass 1 — CRITICAL:**

### SQL & Data Safety
- `src/migrations/20260407_2121_migrate_to_roles_array.ts:16-19` — Raw SQL migration using `ARRAY["role"]`. Column names are hardcoded (not user-controlled), so no injection risk. Uses `sql` template tag correctly.

### Race Conditions & Concurrency
- `src/auth/auth-service.ts:193` — Refresh token equality check (`storedRefreshToken !== refreshToken`) is a safe compare. Token rotation is atomic per-request. No TOCTOU issue.

### LLM Output Trust Boundary
Not applicable — no LLM-generated values in this diff.

### Shell Injection
Not applicable — no shell commands in this diff.

### Enum & Value Completeness
- `src/collections/Users.ts:88-101` — New `roles` field (`hasMany: true`) with options `['admin', 'editor', 'viewer']` aligns with `RbacRole`. The existing `role` field is preserved for backwards compatibility. `getPrimaryRole()` in `auth-service.ts:39-46` correctly falls back: `roles[0] ?? role ?? 'viewer'`.
- All consumers of `RbacRole` (`'admin' | 'editor' | 'viewer'`) remain consistent — no missing cases.

**Pass 2 — INFORMATIONAL:**

### Conditional Side Effects
- `src/api/auth/logout.ts:9` — Comment states "clearing refresh token invalidates all tokens". This is correct behavior for JWT token rotation, but the `_allDevices` parameter is ignored (underscore-prefixed). This is a deliberate design choice (stateless JWT means you can only invalidate via token expiry or blacklist), not a bug.

### Test Gaps
- `src/middleware/rbac.test.ts` — Comprehensive coverage of: valid/invalid tokens, role hierarchy (admin→editor→viewer), optional mode, insufficient roles. Well-tested.

### Dead Code & Consistency
- `SessionStore` and `SessionCard` fully removed — no dangling references remain in `src/`. Remaining `session*` references are legitimate (JWT `sessionId` field, CSRF sessions).
- `auth/index.ts` correctly removes SessionStore export.

### Crypto & Entropy
- `src/api/auth/login.ts:56` — `sessionId = session-${user.id}-${Date.now()}` is a predictable format. However, since the JWT itself is cryptographically signed and this sessionId is not used for any security decisions (only embedded in JWT payload), this is acceptable.

### Performance & Bundle Impact
No new heavy dependencies added.

### Type Coercion at Boundaries
- `src/auth/auth-service.ts:129` — `userId: String(userId)` ensures numeric user IDs are stringified before JWT embedding, ensuring consistency with `payload.userId` (string) used in subsequent lookups.
