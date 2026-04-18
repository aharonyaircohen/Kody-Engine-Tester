
### taskify (2026-04-18T10:10:20)
The questions have been presented to the user. The task classification is complete — this is clearly a **HIGH risk** task touching ~30+ files across auth, middleware, collections, and migrations.

**Summary of my findings:**

- The codebase has a **dual auth system**: `SessionStore`/`UserStore` (SHA-256, session-based) coexists with `AuthService`/`JwtService` (PBKDF2, JWT-based)
- JWT auth already exists (`JwtService` with HMAC-SHA256, blacklist, rotation) — but the old session system in `src/ap
...(truncated)

### build (2026-04-18T10:13:22)
I've written the plan to `/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/.kody/tasks/2650-260418-100454/plan.md`. Here's a summary of what I found and what the plan covers:

**What I found:**

The codebase has a dual auth system:
- **Old (session-based)**: `UserStore`/`SessionStore` (SHA-256, in-memory) — used by `src/api/auth/login.ts` and `src/middleware/auth-middleware.ts`
- **New (JWT-based)**: `AuthService`/`JwtService` (PBKDF2, JWT, Payload-backed) — already fully implemented, use
...(truncated)
