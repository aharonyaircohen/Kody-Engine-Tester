
### build (2026-04-07T21:18:10)
The build passes. Here's a summary of the fixes I made:

**Fixed issues:**

1. **Missing default exports in page components:**
   - `src/pages/board/modal.tsx` - Changed `export function TaskModal` to `export default function TaskModal`
   - `src/pages/board/index.tsx` - Updated import from named to default
   - `src/pages/error/ErrorPage.tsx` - Added default export
   - `src/pages/error/NotFoundPage.tsx` - Added default export

2. **Test files moved out of `src/pages/` directory:**
   - Moved `
...(truncated)
