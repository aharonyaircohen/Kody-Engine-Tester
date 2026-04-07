Now I have a clear picture. Let me create the plan for decomposing the PRD into sub-issues.

## Existing Patterns Found

- `src/collections/Users.ts` — Payload CollectionConfig with `auth: true` providing built-in login/register/password hash fields
- `src/auth/auth-service.ts` — PBKDF2 password verification via `verifyPassword()` matching Payload's `generatePasswordSaltHash` algorithm
- `src/middleware/auth-middleware.ts` — Express-style factory pattern `createAuthMiddleware()` with rate limiting and JWT verification
- `src/api/auth/login.ts` — Login handler using UserStore (SHA-256) coexisting with AuthService (PBKDF2)
- `src/api/auth/register.ts` — Register handler using AuthService

The PRD has 3 tasks with dependencies: User model → endpoints → middleware. However, all three already exist in the codebase in some form. The task is about filing sub-issues in topological order with priority labels and test strategy sections.

## Plan

**Step 1: Parse PRD and identify task structure**

The PRD at `docs/test-prd.md` contains:
1. Add User model with password hash field (no dependencies)
2. Add /login and /register endpoints (depends on Task 1)
3. Add auth middleware to protect existing routes (depends on Task 2)

**Step 2: Create sub-issue 1 — User model**

**File:** `.kody/tasks/754-sub1/task.json`
**Change:** Create task.json with:
- `task_type: "feature"`
- `title: "Add User model with password hash field"`
- `description: "Ensure Users collection has password hash field for JWT authentication. Users collection at src/collections/Users.ts already has auth:true with built-in hash/salt fields via Payload's generatePasswordSaltHash (PBKDF2, 25000 iterations, sha256, 512 bits)."
- `scope: ["src/collections/Users.ts", "src/auth/auth-service.ts"]`
- `risk_level: "low"`
- `existing_patterns: ["src/collections/Users.ts uses auth:true with built-in password hash via Payload generatePasswordSaltHash", "src/auth/auth-service.ts verifyPassword matches Payload's algorithm"]`
- `questions: []`

**File:** `.kody/tasks/754-sub1/task.md`
**Change:** Create task.md with priority label `priority: high` (foundation), Test Strategy section referencing existing tests at `src/collections/Users.test.ts` and `src/auth/auth-service.test.ts`

**Verify:** `ls .kody/tasks/754-sub1/`

---

**Step 3: Create sub-issue 2 — Login/register endpoints**

**File:** `.kody/tasks/754-sub2/task.json`
**Change:** Create task.json with:
- `task_type: "feature"`
- `title: "Add /login and /register endpoints"`
- `description: "File issue for /login and /register endpoints. Existing implementations: src/api/auth/login.ts uses UserStore (SHA-256) while src/api/auth/register.ts uses AuthService (PBKDF2). Recommend standardizing on AuthService per src/auth/auth-service.ts pattern."
- `scope: ["src/api/auth/login.ts", "src/api/auth/register.ts", "src/auth/auth-service.ts"]`
- `risk_level: "medium"`
- `existing_patterns: ["src/auth/auth-service.ts provides login() with PBKDF2 password verification", "src/api/auth/login.ts uses UserStore.findByEmail + UserStore.verifyPassword"]`
- `questions: ["Should login.ts be refactored to use AuthService instead of UserStore for consistent PBKDF2 hashing?"]`

**File:** `.kody/tasks/754-sub2/task.md`
**Change:** Create task.md with priority label `priority: high`, depends on sub-issue 1, Test Strategy section referencing `src/api/auth/login.test.ts` and `src/api/auth/register.test.ts`

**Verify:** `ls .kody/tasks/754-sub2/`

---

**Step 4: Create sub-issue 3 — Auth middleware**

**File:** `.kody/tasks/754-sub3/task.json`
**Change:** Create task.json with:
- `task_type: "feature"`
- `title: "Add auth middleware to protect routes"`
- `description: "File issue for auth middleware to protect existing routes. src/middleware/auth-middleware.ts already implements createAuthMiddleware factory with rate limiting and JWT verification. Evaluate integrating with existing withAuth HOC at src/auth/withAuth.ts."
- `scope: ["src/middleware/auth-middleware.ts", "src/auth/withAuth.ts"]`
- `risk_level: "medium"`
- `existing_patterns: ["src/middleware/auth-middleware.ts createAuthMiddleware factory with rate limiting", "src/auth/withAuth.ts HOC wrapping route handlers with JWT validation and RBAC"]`
- `questions: ["Should auth-middleware.ts be used alongside withAuth HOC or replace it?"]`

**File:** `.kody/tasks/754-sub3/task.md`
**Change:** Create task.md with priority label `priority: medium` (depends on endpoints), Test Strategy section referencing `src/middleware/auth-middleware.test.ts`

**Verify:** `ls .kody/tasks/754-sub3/`

---

**Step 5: File issues via GitHub API (topological order: sub1 → sub2 → sub3)**

**File:** `bin/file-issues.sh` (temporary script)
**Change:** Use GitHub CLI (`gh`) to file issues in topological order:
```bash
gh issue create --title "[Auth] User model with password hash" --body "$(cat .kody/tasks/754-sub1/task.md)" --label "priority:high"
gh issue create --title "[Auth] Login and register endpoints" --body "$(cat .kody/tasks/754-sub2/task.md)" --label "priority:high" --depend-on "$(gh issue list --search "[Auth] User model" --json number --jq '.[0].number')"
gh issue create --title "[Auth] Auth middleware for route protection" --body "$(cat .kody/tasks/754-sub3/task.md)" --label "priority:medium" --depend-on "$(gh issue list --search "[Auth] Login and register" --json number --jq '.[0].number')"
```

**Verify:** `gh issue list --search "[Auth]"` shows 3 issues in topological order
