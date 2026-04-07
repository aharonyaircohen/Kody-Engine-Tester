
### taskify (2026-04-07T21:34:09)
{
  "task_type": "feature",
  "title": "Add /login and /register API route endpoints",
  "description": "Create Next.js route handlers at src/app/api/auth/login/route.ts and src/app/api/auth/register/route.ts to expose the existing login/register business logic as POST HTTP endpoints. The existing src/api/auth/login.ts and src/api/auth/register.ts provide the business logic; this task creates the API surface layer.",
  "scope": [
    "src/app/api/auth/login/route.ts",
    "src/app/api/auth/regis
...(truncated)

### plan (2026-04-07T21:34:47)
## Plan: Add /login and /register API Endpoints

### Steps

**Step 1: Create `src/app/api/auth/register/route.ts`**
**File:** `src/app/api/auth/register/route.ts`
**Change:** New file — POST handler that calls existing `register()` from `src/api/auth/register.ts`
**Why:** Exposes register as HTTP POST endpoint at `/api/auth/register`
**Verify:** `pnpm test:int -- --run src/api/auth/register.test.ts`

```typescript
import { NextRequest } from 'next/server'
import { register } from '@/api/auth/reg
...(truncated)

### build (2026-04-07T21:45:52)
All tasks completed successfully. Here's the summary:

**Files created:**

1. **`src/app/api/auth/register/route.ts`** - POST handler exposing the register business logic
2. **`src/app/api/auth/login/route.ts`** - POST handler exposing the login business logic
3. **`src/app/api/auth/register/route.test.ts`** - Unit tests for register endpoint (7 tests)
4. **`src/app/api/auth/login/route.test.ts`** - Unit tests for login endpoint (6 tests)

**Test Results:**
- 1776 tests pass (including all new r
...(truncated)
