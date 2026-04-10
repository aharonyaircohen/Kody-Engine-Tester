## Existing Patterns Found

- `src/app/api/enroll/route.ts` — Next.js App Router POST handler pattern: `export const POST = withAuth(async (request: NextRequest, { user }) => { ... }, { roles: [...] })`
- `src/app/api/health/route.ts` — Simple GET handler returning `new Response(JSON.stringify(...), { status: 200, headers: { 'Content-Type': 'application/json' } })`
- `src/api/auth/register.ts` — Existing register function with email/password validation, duplicate check, and strength validation
- `src/api/auth/login.ts` — Existing login function with credential verification
- `src/auth/auth-service.ts` — AuthService using Payload and JwtService for login flow

## Plan

**Step 1: Create the register route handler**

**File:** `src/app/api/auth/register/route.ts`
**Change:** New file with POST handler that parses JSON body, calls `register()` from `src/api/auth/register.ts`, and returns appropriate HTTP response. Public endpoint (no `withAuth`).
**Why:** Reuse existing register logic; route handler only handles HTTP concerns.
**Verify:** `pnpm test:int -- --run src/api/auth/register.test.ts`

---

**Step 2: Create the login route handler**

**File:** `src/app/api/auth/login/route.ts`
**Change:** New file with POST handler that parses JSON body, calls `login()` from `src/api/auth/login.ts` (which uses UserStore/SessionStore), and returns appropriate HTTP response. Public endpoint.
**Why:** Follow same pattern as register; login uses UserStore which is already in auth module.
**Verify:** `pnpm test:int -- --run src/api/auth/login.test.ts`

---

**Step 3: Verify full test suite passes**

**File:** (none — verification step)
**Change:** Run `pnpm test:int` to confirm no regressions.
**Why:** Ensure the new route handlers integrate correctly.
**Verify:** `pnpm test:int`
