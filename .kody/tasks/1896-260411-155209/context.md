
### taskify (2026-04-11T15:56:00)
{
  "task_type": "feature",
  "title": "Add /login and /register API endpoints",
  "description": "Create HTTP route handlers at POST /api/auth/login and POST /api/auth/register. The login endpoint accepts {email, password} and returns {user, token}. The register endpoint accepts {email, password}, creates a User with hashed password, and returns {user, token}. Both must exclude passwords from response bodies, return 401 for invalid credentials, and register must return 409 for duplicate emails.
...(truncated)

### plan (2026-04-11T15:56:22)
## Existing Patterns Found

- `src/app/api/enroll/route.ts` — Next.js App Router POST handler pattern: parse JSON body, call service, return Response with status
- `src/api/auth/login.ts` — Login business logic using UserStore, SessionStore, JwtService (already implemented)
- `src/api/auth/register.ts` — Register business logic using Payload + AuthService (already implemented)
- `src/auth/index.ts` — Exports module-level singletons: `userStore`, `sessionStore`, `jwtService`
- `src/services/progr
...(truncated)

### build (2026-04-11T15:57:46)
I've implemented both endpoints:

**`POST /api/auth/login`** (`src/app/api/auth/login/route.ts`):
- Accepts `{ email, password }`
- Returns `{ user, token, refreshToken }` on success (user excludes `passwordHash`)
- Returns 400 for missing fields, 401 for invalid credentials

**`POST /api/auth/register`** (`src/app/api/auth/register/route.ts`):
- Accepts `{ email, password, confirmPassword }`
- Returns `{ user, token, refreshToken }` on success (user excludes `passwordHash`)
- Returns 409 for du
...(truncated)
