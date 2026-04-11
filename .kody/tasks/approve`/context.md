
### taskify (2026-04-11T16:17:31)
{
  "task_type": "feature",
  "title": "Add /login and /register API endpoints",
  "description": "Implement POST /register and POST /login endpoints for authentication. /register creates users with hashed passwords and returns 201 with user object (no passwordHash). /login validates credentials and returns JWT on success or 401 on failure. Requires input validation for email format and password min 8 chars, duplicate email returns 409.",
  "scope": [
    "src/app/api/auth/login/route.ts",
    "
...(truncated)

### plan (2026-04-11T16:18:38)
Now I have enough context to write the plan. Let me create it.

## Implementation Plan

### Step 1: Create registration route handler

**File:** `src/app/api/auth/register/route.ts`
**Change:** Create new file with POST handler for user registration
**Why:** Public endpoint for creating new users - no `withAuth` wrapper needed
**Verify:** `pnpm test:int -- --run src/app/api/auth/register`

```typescript
import { NextRequest } from 'next/server'
import { getPayloadInstance } from '@/services/prog
...(truncated)

### build (2026-04-11T16:23:20)
Implementation complete. Here's what was created:

**Files Created:**

1. **`src/app/api/auth/register/route.ts`** - POST `/register` endpoint
   - Accepts `{ email, password }` in request body
   - Validates email format and password (min 8 chars)
   - Checks for duplicate email (returns 409)
   - Creates user with Payload's built-in auth (handles password hashing)
   - Returns 201 with user object (no passwordHash)

2. **`src/app/api/auth/login/route.ts`** - POST `/login` endpoint
   - Accepts
...(truncated)
