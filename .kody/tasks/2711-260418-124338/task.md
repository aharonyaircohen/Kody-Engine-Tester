# Consolidate /login and /register to use Payload auth

## Context
`login.ts` uses `UserStore` (in-memory SHA-256) while `register.ts` uses `AuthService` (Payload PBKDF2). These two endpoints must be unified to both use Payload as the single auth source, eliminating the dual auth system anti-pattern.

## Acceptance Criteria
- Both `/api/auth/login` and `/api/auth/register` use `AuthService` which operates on Payload users
- `login.ts` is refactored to use `AuthService.login()` instead of `UserStore`
- `register.ts` already uses `AuthService` — no change needed there
- Password verification uses PBKDF2 (25000 iterations) matching Payload's internal algorithm
- Existing tests for login/register are updated to reflect the unified auth system

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2711-260418-124338`

