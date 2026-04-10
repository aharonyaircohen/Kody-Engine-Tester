
### taskify (2026-04-10T00:48:43)
Done. Created:

- **`src/auth/role-hierarchy.ts`** — exports `hasPermission(userRole: string, requiredRole: string): boolean` with hierarchy `admin (3) > editor (2) > viewer (1) > guest (0)`. Invalid roles return `false`.

- **`src/auth/role-hierarchy.test.ts`** — 23 tests covering all hierarchy levels and invalid role edge cases.

All tests pass:
```
✓ src/auth/role-hierarchy.test.ts (23 tests) 7ms
```


### build (2026-04-10T00:50:29)
The implementation is complete and verified:

**Summary:**
- **`src/auth/role-hierarchy.ts`** — exports `hasPermission(userRole: string, requiredRole: string): boolean` with hierarchy `admin (3) > editor (2) > viewer (1) > guest (0)`. Invalid roles return `false`.
- **`src/auth/role-hierarchy.test.ts`** — 23 tests covering all hierarchy levels and invalid role edge cases.
- All 23 tests pass
- The role-hierarchy files are not in the TypeScript error list (pre-existing errors in other parts of th
...(truncated)
