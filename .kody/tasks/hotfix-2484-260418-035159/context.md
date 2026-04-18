
### build (2026-04-18T04:04:54)
Here's my analysis and plan:

**Key Finding:** `src/utils/helpers.ts` already has `export default helpers` (line 51) — no fix needed there. The actual build-breaking errors are in `src/pages/` files missing default exports:

1. **`src/pages/error/ErrorPage.tsx`** — uses named export only → convert to default
2. **`src/pages/error/NotFoundPage.tsx`** — uses named export only → convert to default  
3. **`src/pages/board/modal.tsx`** — component (not a page) in `pages/` dir → move to `src/component
...(truncated)
