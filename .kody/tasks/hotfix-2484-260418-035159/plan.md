# Plan: Fix Build Failures — Missing Default Exports

## Context

`pnpm build` fails because Next.js Pages Router requires every file in `src/pages/` to have a default export. Several files use only named exports.

Note: the task description references `src/utils/helpers.ts`, but that file already has `export default helpers` at line 51 — no fix needed there. The actual build-breaking errors are in `src/pages/` files.

## Changes

### Step 1 — `src/pages/error/ErrorPage.tsx`
Convert named export to default:
```
- export function ErrorPage({ error, statusCode = 500 }: ErrorPageProps) {
+ export default function ErrorPage({ error, statusCode = 500 }: ErrorPageProps) {
```

### Step 2 — `src/pages/error/NotFoundPage.tsx`
Convert named export to default:
```
- export function NotFoundPage() {
+ export default function NotFoundPage() {
```

### Step 3 — `src/pages/board/modal.tsx`
This is a component (imported by `board/index.tsx`), not a page — it should not live in `src/pages/`. Move it:
- Create `src/components/board/Modal.tsx` with the same content
- Update `src/pages/board/index.tsx` import from `'./modal'` → `'@/components/board/Modal'`
- Delete `src/pages/board/modal.tsx`

## Verification
1. Run `pnpm build` → should compile with zero TypeScript errors
2. Hotfix pipeline: `build` → `verify` (tests skipped, `skipTests: isHotfix`) → `ship` (PR created)

## Files Modified
- `src/pages/error/ErrorPage.tsx`
- `src/pages/error/NotFoundPage.tsx`
- `src/pages/board/modal.tsx` (move to `src/components/board/Modal.tsx`)
- `src/pages/board/index.tsx` (update import path)
