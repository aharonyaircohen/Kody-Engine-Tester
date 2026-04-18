
### taskify (2026-04-18T10:00:26)
I've completed my analysis and written the plan. The key findings are:

1. **All routes are already wrapped** with `withAuth` — no new route changes needed
2. **Two concrete fixes required:**
   - Fix 401 message in `src/auth/withAuth.ts` from `"Missing or invalid Authorization header"` → `"Unauthorized"` (1 line)
   - Remove 7 dead `if (!user)` blocks across route handlers since `withAuth` guarantees the user exists when the handler runs

### build (2026-04-18T10:02:23)
The plan is written to `.kody/tasks/2634-260418-095432/PLAN.md`. Here's a summary of what I found and what needs to change:

**Current state**: All routes are already wrapped with `withAuth`. Two concrete fixes are needed:

1. **`src/auth/withAuth.ts`**: Change the 401 error message from `"Missing or invalid Authorization header"` → `"Unauthorized"` (1 line)

2. **9 dead `if (!user)` blocks** across 9 route files — these are unreachable because `withAuth` already guarantees the user exists befor
...(truncated)
