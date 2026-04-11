After reviewing the codebase, I can see:

1. `src/middleware/auth-middleware.ts` exists with a `createAuthMiddleware` factory
2. `src/middleware/auth-middleware.test.ts` exists with comprehensive unit tests
3. **No** `src/middleware.ts` (Next.js App Router middleware entry point) exists
4. Routes already use `withAuth` HOC from `@/auth/withAuth`
5. The `auth-middleware.ts` uses `UserStore`/`SessionStore` (in-memory) while `withAuth` uses `AuthService` (Payload CMS)

The gap is that `auth-middleware.ts` has never been connected to the Next.js request pipeline. The task asks to create the Next.js middleware entry point that uses this factory.

## Implementation Plan

**Step 1: Create `src/middleware.ts` (Next.js App Router middleware entry point)**

Create a Next.js middleware entry point at `src/middleware.ts` that:
- Uses `createAuthMiddleware` from `src/middleware/auth-middleware.ts`
- Instantiates `UserStore`, `SessionStore`, and `JwtService` as module-level singletons
- Wraps `NextRequest`/`NextResponse` to connect with the auth middleware factory
- Returns `NextResponse` with appropriate status codes

**File:** `src/middleware.ts`
**Change:** Create the middleware entry point
**Why:** This is the standard Next.js App Router middleware file that runs before route handlers
**Verify:** `pnpm build` compiles without errors

**Step 2: Run existing tests to verify middleware implementation**

**Verify:** `pnpm test:int src/middleware/auth-middleware.test.ts` passes

**Step 3: Create integration test for the middleware entry point**

**File:** `src/middleware.test.ts` (or add to existing test file)
**Change:** Add test that verifies the middleware correctly handles protected routes
**Why:** The task specifies "Integration tests: protected endpoint accessible with valid token, returns 401 without token"
**Verify:** `pnpm test:int` passes

## Existing Patterns Found

- **`src/middleware/auth-middleware.ts`**: `createAuthMiddleware(userStore, sessionStore, jwtService)` factory — JWT verification, session validation, rate limiting, returns `AuthContext { user, session, error, status }`. Reused as core logic.
- **`src/middleware/request-logger.ts`**: `middleware(request: NextRequest): NextResponse` pattern — Next.js middleware function returning `NextResponse.next()` for passthrough.
- **`src/auth/withAuth.ts`**: Route handler wrapping pattern — routes already use this for auth.
- **`src/auth/jwt-service.ts`**: JWT `signAccessToken`/`signRefreshToken`/`verify` methods — token structure used by both login systems.

## Questions

None — implementation approach is clear from existing patterns and task requirements.
