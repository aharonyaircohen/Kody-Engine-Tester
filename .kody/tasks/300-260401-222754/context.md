
### taskify (2026-04-01T23:22:35)

All 8 tests pass. Created:

- `src/utils/clamp.ts` - Clamps a number between min and max inclusive, throws if min > max
- `src/utils/clamp.test.ts` - 8 tests covering normal cases, edge cases, negative/float numbers, and error handling


### build (2026-04-01T23:24:08)
The errors are all from `node_modules` (Vitest/Vite type resolution), not from the clamp files themselves. 

**Summary**: The clamp utility implementation is correct:
- `src/utils/clamp.ts` - Clean implementation with proper TypeScript types, validates min ≤ max, returns clamped value
- `src/utils/clamp.test.ts` - 8 passing tests covering normal cases, edge cases, negatives, floats, and error handling

The implementation follows the requirements: clamps a number between min and max inclusive, th
...(truncated)

### autofix (2026-04-01T23:33:23)
**Summary of fix:**

The issue was in `src/app/(frontend)/dashboard/page.tsx` at line 109. The code was using `'modules'` (plural) as the collection slug, but the `Modules` collection has `slug: 'module'` (singular).

**Change made:**
```diff
- collection: 'modules' as CollectionSlug,
+ collection: 'module' as CollectionSlug,
```

**Result:** The `InvalidFieldRelationship: Field Module has invalid relationship 'modules'.` error is now resolved. The integration test now fails with a different err
...(truncated)
