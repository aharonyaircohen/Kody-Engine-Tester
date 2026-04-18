# Add password hash field to Users collection

## Context
The Users Payload collection has `auth: true` which provides built-in password hashing via Payload's internal mechanism. However, the codebase has two parallel auth systems: `UserStore` (in-memory, SHA-256) used by `login.ts`, and `AuthService` (Payload + JWT with PBKDF2) used by `register.ts`. This dual auth system is a documented anti-pattern causing role divergence and inconsistent password hashing.

## Acceptance Criteria
- Users collection password hashing uses Payload's built-in auth (`auth: true`)
- `hash` and `salt` fields are accessible on User documents for PBKDF2 verification (25000 iterations, sha256, 512 bits)
- `UserStore` (in-memory, SHA-256) is deprecated in favor of Payload-based auth
- Role types are unified: `RbacRole = 'admin' | 'editor' | 'viewer'` from `auth-service.ts`

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2710-260418-124337`

