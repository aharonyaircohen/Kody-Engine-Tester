## Verdict: PASS

## Summary

This diff creates 5 new auth API routes (login, logout, profile, refresh, register) and adds a Payload migration for auth token fields + `isActive` column. The routes correctly use the existing `AuthService`/`JwtService` infrastructure and `withAuth` HOC. All previously identified critical/major issues have been addressed.

## Findings

### Critical

None.

### Major

None.

### Minor

**`src/app/api/auth/login/route.ts:19`** and **`src/app/api/auth/refresh/route.ts:19`** — Each route creates a new `JwtService` instance rather than reusing the module-level singleton from `src/auth/index.ts`. Since `JwtService` maintains an in-memory `blacklistedTokens` Map, these per-request instances don't share blacklist state. Currently harmless since nothing is blacklisted, but creates subtle inconsistency with `withAuth.ts` which uses a cached singleton.

---

## Two-Pass Review

**Pass 1 — CRITICAL (must fix before merge):**

### SQL & Data Safety
- Migration uses raw SQL (`ALTER TABLE`) — consistent with existing migration patterns. No SQL injection risk (static column names).

### Race Conditions & Concurrency
- `AuthService.refresh()` — token check-and-update is not fully atomic, but refresh tokens are user-specific; concurrent calls result in one caller winning, the other getting a token mismatch on next use. Acceptable for this threat model.
- `register/route.ts` — email uniqueness check followed by create has a TOCTOU window. However, Payload's `auth: true` config handles email uniqueness internally.

### LLM Output Trust Boundary
- N/A.

### Shell Injection
- N/A.

### Enum & Value Completeness
- `RbacRole = 'admin' | 'editor' | 'viewer'` — `Users.ts:78` defines `options: ['admin', 'editor', 'viewer']`. Consistent.

**Pass 2 — INFORMATIONAL:**

### Conditional Side Effects
- None.

### Test Gaps
- No co-located `*.test.ts` files for the 5 new route handlers in `src/app/api/auth/`.

### Dead Code & Consistency
- Per-request `JwtService` instance creation in login/refresh routes (see Minor above).

### Crypto & Entropy
- `JwtService` uses Web Crypto API with HMAC-SHA256 — sound.
- `verifyPassword` uses PBKDF2 (25000 iterations) with `crypto.timingSafeEqual` — correct.

### Performance & Bundle Impact
- Minor per-request overhead from creating new `JwtService`/`AuthService` instances in login/refresh routes. Negligible.

### Type Coercion at Boundaries
- Multiple `as any` casts — pre-existing pattern, not introduced by this diff.
