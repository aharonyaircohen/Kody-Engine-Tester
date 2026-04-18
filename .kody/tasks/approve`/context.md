
### taskify (2026-04-18T13:11:52)
Now I have a complete picture. Let me compile the audit findings and produce the classification.

**Audit Summary:**

All 15 API routes in `src/app/api/` already use `withAuth`. However, several issues exist:

1. **Dead code (`if (!user)` checks after `withAuth`)**: `withAuth` guarantees user is present before the handler runs, so inner `if (!user)` guards are redundant dead code in 8 routes.
2. **Duplicate routes**: `src/routes/notifications.ts` duplicates `src/app/api/notifications/route.ts` (
...(truncated)

### build (2026-04-18T13:19:52)
All changes are complete. Here's a summary of what was done:

## Audit & Cleanup Summary

### ✅ Auth Coverage — No Issues Found
All 15 API routes in `src/app/api/` already correctly use `withAuth`. No unprotected routes were found. Public routes (`/api/health`, `/api/csrf-token`) are correctly unprotected.

### 🗑️ Dead Code Removed (9 files)
All routes that had `withAuth` + `{ user }` in their handler but then checked `if (!user)` — this check is unreachable because `withAuth` guarantees the us
...(truncated)
