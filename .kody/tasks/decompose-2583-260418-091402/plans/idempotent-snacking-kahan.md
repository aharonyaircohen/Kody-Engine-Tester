# Plan: Add `capitalize` utility

## Context
The task is a low-risk, single-file feature: add a `capitalize` string utility to `src/utils/`, following the exact pattern already established by `capitalize-words`, `to-kebab-case`, `slugify`, and dozens of other co-located utils in the project.

**What `capitalize` does** (distinct from `capitalizeWords`):
- `capitalize('hello world')` → `'Hello world'` — capitalizes only the **first character** of the whole string, lowercases the rest.
- `capitalizeWords('hello world')` → `'Hello World'` — capitalizes the first letter of **every word**.

## Implementation

### 1. Create `src/utils/capitalize.ts`

```typescript
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
```

### 2. Create `src/utils/capitalize.test.ts`

Follow the `capitalize-words.test.ts` pattern — `describe/it/expect` from vitest, 6–8 test cases covering:
- Basic capitalize (first letter upper, rest lower)
- Single word
- Empty string
- Already capitalized
- Already all-uppercase
- Single character
- String with spaces (only first char is upper)
- Lowercase-only input

## Verification
1. `pnpm test:int src/utils/capitalize.test.ts` — vitest runs the new test file
2. `pnpm tsc --noEmit` — no type errors
