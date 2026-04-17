# Plan: Wire auth middleware — error message fixes

## Context

All specified routes (`/api/notes`, `/api/quizzes/*`, `/api/courses/search`, `/api/enroll`, `/api/gradebook/*`) are **already wrapped with `withAuth`**. No route handler changes are needed.

Two gaps prevent acceptance criteria from passing:

1. **`src/auth/withAuth.ts` line 72** — missing token returns `{ error: 'Missing or invalid Authorization header' }` but acceptance criteria requires `{ error: 'Unauthorized' }`.
2. **`src/auth/_auth.ts` line 55** — insufficient role returns `{ error: 'Forbidden: requires role ...' }` but acceptance criteria requires `{ error: 'Forbidden' }`.

## Changes

### 1. `src/auth/withAuth.ts` — fix 401 message
- **Line 71–74**: Change `{ error: 'Missing or invalid Authorization header' }` → `{ error: 'Unauthorized' }`

### 2. `src/auth/_auth.ts` — fix 403 message
- **Line 54–57**: Change `error: 'Forbidden: requires role ...'` → `error: 'Forbidden'`

## Files

- `src/auth/withAuth.ts`
- `src/auth/_auth.ts`

## Verification

After changes, run:
```
pnpm tsc --noEmit
pnpm test:int
```

The integration tests for auth (request without token → 401, request with wrong role → 403) will now pass because the error messages match the expected values.
