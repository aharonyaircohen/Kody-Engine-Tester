
### build (2026-04-18T16:58:42)
The hotfix is complete. Here's a summary of all fixes applied to get the build passing:

### Changes Made

1. **`src/pages/board/modal.tsx`** — Added `export default TaskModal` (was missing a default export causing Next.js Pages Router type check to fail)

2. **`src/pages/error/ErrorPage.tsx`** — Added `export default ErrorPage`

3. **`src/pages/error/NotFoundPage.tsx`** — Added `export default NotFoundPage`

4. **`src/app/(frontend)/instructor/courses/[id]/edit/page.tsx`** — Added null guard fo
...(truncated)
