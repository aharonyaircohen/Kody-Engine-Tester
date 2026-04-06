
### build (2026-04-06T10:02:10)
The fix is already in place. The `slugify` function in `src/utils/slugify.ts` has a null guard at line 9:

```typescript
if (!str) return ''
```

This correctly handles `null`, `undefined`, and other falsy values by returning an empty string before attempting any string operations.

All 18 slugify tests pass, including the explicit test case at line 55-58:
```typescript
it('handles null/undefined as falsy', () => {
  expect(slugify(null as unknown as string)).toBe('')
  expect(slugify(undefined 
...(truncated)
