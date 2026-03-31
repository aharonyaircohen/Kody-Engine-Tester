/**
 * Migration Script: Refactor Auth System with Session-Based Approach
 *
 * This document outlines the migration steps taken to refactor the authentication
 * system to use a proper session-based approach.
 *
 * Migration Date: 2026-03-31
 * Previous Auth Model: JWT-only without session management
 * New Auth Model: JWT + Session Store with refresh token rotation
 *
 * ============================================================
 * STRUCTURE CHANGES
 * ============================================================
 *
 * BEFORE:
 * ├── src/auth/
 * │   ├── index.ts                    # Exports userStore, sessionStore, jwtService
 * │   ├── user-store.ts              # User CRUD + password hashing
 * │   ├── session-store.ts           # Session management
 * │   ├── jwt-service.ts             # JWT signing/verification
 * │   ├── jwt-service.test.ts
 * │   ├── session-store.test.ts
 * │   └── user-store.test.ts
 * ├── src/middleware/
 * │   ├── auth-middleware.ts         # Auth validation middleware
 * │   └── auth-middleware.test.ts
 * └── src/api/auth/
 *     ├── login.ts                   # Login logic
 *     ├── logout.ts                  # Logout logic
 *     ├── profile.ts                 # Profile management
 *     ├── refresh.ts                  # Token refresh
 *     └── *.test.ts                  # Tests for each
 *
 * AFTER:
 * ├── src/auth/
 * │   ├── index.ts                   # Exports everything from auth module
 * │   ├── user-store.ts              # User CRUD + password hashing (unchanged)
 * │   ├── session-store.ts           # Session management (unchanged)
 * │   ├── jwt-service.ts              # JWT signing/verification (unchanged)
 * │   ├── authController.ts          # NEW: Login/logout/me combined controller
 * │   ├── authMiddleware.ts           # NEW: Auth middleware in auth module
 * │   ├── authRoutes.ts               # NEW: Route definitions
 * │   ├── authController.test.ts      # NEW: Controller tests
 * │   └── authRoutes.test.ts          # NEW: Routes tests
 * ├── src/middleware/
 * │   ├── auth-middleware.ts          # Re-exports from src/auth/authMiddleware.ts
 * │   └── ... (other middleware unchanged)
 * ├── src/app/api/auth/
 * │   ├── login/route.ts              # NEW: POST /auth/login endpoint
 * │   ├── logout/route.ts             # NEW: POST /auth/logout endpoint
 * │   └── me/route.ts                 # NEW: GET /auth/me endpoint
 * └── src/api/auth/                   # (legacy, kept for compatibility)
 *     └── ... (original files unchanged)
 *
 * ============================================================
 * NEW FILES CREATED
 * ============================================================
 *
 * 1. src/auth/authController.ts
 *    - Combines login, logout, me, and refresh logic into a single controller class
 *    - Uses dependency injection for userStore, sessionStore, jwtService
 *    - Provides typed interfaces for all operations
 *
 * 2. src/auth/authMiddleware.ts
 *    - Moved from src/middleware/auth-middleware.ts to src/auth/
 *    - Validates session tokens from Authorization header
 *    - Includes rate limiting per IP
 *    - Checks session generation for token rotation detection
 *
 * 3. src/auth/authRoutes.ts
 *    - Defines AUTH_ROUTES array with route metadata
 *    - Provides getRouteHandler factory for creating route handlers
 *    - Documents the API contract
 *
 * 4. src/app/api/auth/login/route.ts
 *    - POST /auth/login
 *    - Accepts { email, password }
 *    - Returns { accessToken, refreshToken, user }
 *
 * 5. src/app/api/auth/logout/route.ts
 *    - POST /auth/logout
 *    - Requires Authorization header
 *    - Optional body: { allDevices: boolean }
 *    - Returns { success: true }
 *
 * 6. src/app/api/auth/me/route.ts
 *    - GET /auth/me
 *    - Requires Authorization header
 *    - Returns user profile (without passwordHash/salt)
 *
 * ============================================================
 * SESSION FLOW
 * ============================================================
 *
 * 1. LOGIN FLOW:
 *    - Client sends POST /auth/login with { email, password }
 *    - Server validates credentials against UserStore
 *    - Server creates Session in SessionStore with access + refresh tokens
 *    - Server returns { accessToken, refreshToken, user }
 *
 * 2. AUTHENTICATED REQUESTS:
 *    - Client includes Authorization: Bearer <accessToken>
 *    - Middleware validates token signature and expiry
 *    - Middleware checks SessionStore for valid session
 *    - Middleware verifies generation matches (for token rotation detection)
 *
 * 3. TOKEN REFRESH:
 *    - Client sends POST /auth/refresh with { refreshToken }
 *    - Server validates refresh token
 *    - Server creates new token pair with incremented generation
 *    - Server blacklists old refresh token
 *    - Server returns { accessToken, refreshToken }
 *
 * 4. LOGOUT:
 *    - Client sends POST /auth/logout with Authorization header
 *    - Server revokes session from SessionStore
 *    - Server blacklists access token
 *    - Optionally revokes all user sessions (allDevices: true)
 *
 * ============================================================
 * BACKWARDS COMPATIBILITY
 * ============================================================
 *
 * - Original src/api/auth/* files remain unchanged
 * - New src/app/api/auth/* routes provide the same functionality
 * - src/middleware/auth-middleware.ts re-exports from src/auth/authMiddleware.ts
 * - Both import paths continue to work
 *
 * ============================================================
 * TESTING
 * ============================================================
 *
 * Run tests with:
 *   pnpm test:int        # Integration tests
 *   pnpm test:e2e        # E2E tests
 *   pnpm test            # Both
 *
 * New tests added:
 *   src/auth/authController.test.ts
 *   src/auth/authRoutes.test.ts
 *
 * Existing tests:
 *   src/auth/session-store.test.ts    # Passes
 *   src/auth/user-store.test.ts       # Passes
 *   src/auth/jwt-service.test.ts      # Passes
 *   src/middleware/auth-middleware.test.ts  # Passes
 *
 * ============================================================
 * ENVIRONMENT VARIABLES
 * ============================================================
 *
 * Required:
 *   JWT_SECRET=<secret>    # Secret for signing JWTs
 *
 * Optional:
 *   NODE_ENV=development  # Enables debug logging
 *
 * ============================================================
 * SECURITY CONSIDERATIONS
 * ============================================================
 *
 * 1. Token Rotation: Each refresh increments session.generation
 *    - Old tokens are rejected if a newer session exists
 *
 * 2. Rate Limiting: 100 requests per minute per IP
 *    - Applied in auth middleware before token validation
 *
 * 3. Account Lockout: After 5 failed login attempts
 *    - Lockout lasts 30 minutes
 *
 * 4. Max Sessions: 5 concurrent sessions per user
 *    - Oldest session is evicted when limit exceeded
 *
 * 5. Token Blacklist: Revoked tokens are blacklisted
 *    - Prevents use of logged-out tokens until natural expiry
 *
 * ============================================================
 * ROLLBACK PROCEDURE
 * ============================================================
 *
 * To rollback to previous auth system:
 * 1. Remove src/app/api/auth/ directory
 * 2. Remove src/auth/authController.ts
 * 3. Remove src/auth/authMiddleware.ts (keep src/middleware/auth-middleware.ts)
 * 4. Remove src/auth/authRoutes.ts
 * 5. Restore src/auth/index.ts to original export pattern
 * 6. Remove new test files
 *
 * ============================================================
 */

console.log('Auth Migration Documentation')
console.log('============================')
console.log('This script documents the auth system refactoring.')
console.log('See script comments for full migration details.')
