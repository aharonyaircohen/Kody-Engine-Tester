The plan has been written to `.kody/tasks/269-260401-211703/plan.md`. It contains 14 steps:

**Key highlights:**
1. Add `refreshToken`, `tokenExpiresAt`, `lastTokenUsedAt` fields to Users collection
2. Create a Payload-backed `AuthService` (replacing in-memory stores)
3. Migrate roles from `student/instructor/admin` → `admin/editor/viewer`
4. Create a `withAuth()` HOC for consistent auth across all 14 API routes
5. Fix the **critical security gap** — `notes/route.ts` is currently completely unprotected
6. TDD: tests before implementation for `AuthService` and `_auth` helper

**Three architectural questions at the end of the plan** that need product input:
- Token rotation strategy (generation counter vs DB revocation)
- How to map existing roles during migration
- Refresh token storage (HMAC vs bcrypt)
