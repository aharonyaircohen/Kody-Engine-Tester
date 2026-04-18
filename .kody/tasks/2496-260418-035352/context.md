
### taskify (2026-04-18T04:01:24)
I'm ready to hand off. Here's a summary of what I found and what I need to proceed:

**What I know (from project memory + task description):**

- The project is a Next.js 16.2.1 + TypeScript + Payload CMS app
- Two existing auth implementations exist at `src/api/auth/login.ts` and `src/api/auth/register.ts` using different backends (UserStore SHA-256 vs AuthService PBKDF2)
- AuthService (PBKDF2) is the preferred backend; `JwtService` exists for token generation
- Payload Users collection at `src
...(truncated)

### build (2026-04-18T04:07:03)
The plan is ready for review. It covers:

- **Rewriting `login.ts`** to drop `UserStore`/`SessionStore`/`JwtService` params and call `getAuthService()` internally
- **Rewriting `register.ts`** to remove `payload`/`authService` params, call `getAuthService()` and `getPayloadInstance()` internally
- **Creating two new Route Handlers** at `src/app/api/auth/login/route.ts` and `src/app/api/auth/register/route.ts` (POST, no auth, map errors to HTTP status codes)
- **Updating both test files** to matc
...(truncated)
