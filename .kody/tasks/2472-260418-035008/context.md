
### taskify (2026-04-18T03:55:02)
The plan is ready for your review. Here's a summary of the classification:

**Task Type:** `feature`  
**Risk Level:** `high` — 20+ files across auth, middleware, collections, and API routes; database schema changes; core authentication logic

**Key findings from exploration:**
- The codebase has **two auth systems coexisting**: `session-store.ts`/`user-store.ts` (SHA-256, session-dependent) and `auth-service.ts`/`jwt-service.ts` (PBKDF2+JWT, the preferred pattern per project conventions)
- `src
...(truncated)

### build (2026-04-18T03:57:47)
The build plan is complete. Here's a summary of what needs to be implemented:

## Plan Summary: JWT Auth Migration (P1T03)

**Goal:** Replace the session-based auth system (`session-store.ts`/`user-store.ts`) with the JWT-based `AuthService` pattern across the codebase.

**Key changes:**
1. **`src/collections/Users.ts`** — Add `jwtSecret` hidden field to the Payload Users collection
2. **`src/auth/session-store.ts`** + **`src/auth/user-store.ts`** — Deprecate with `@deprecated` comments (keep fi
...(truncated)
