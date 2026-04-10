
### taskify (2026-04-10T17:18:47)
The work is already done. The file `src/utils/bad-types.ts` exists with the correct content, and type checking fails as expected:

```
src/utils/bad-types.ts(2,3): error TS2322: Type 'number' is not assignable to type 'string'.
```

The pipeline is stuck in a loop because of a git synchronization issue - the local branch is based on `main` but the remote branch `1746--mem-20260410-1437-mf2-add-function-with-wrong` already has the commit with the file, causing `git push --force-with-lease` to be 
...(truncated)

### build (2026-04-10T17:19:22)

**Verification Complete**

The file `src/utils/bad-types.ts` exists with the correct content:

```typescript
export function getCount(): string {
  return 42;
}
```

The typecheck confirms the intentional error:
```
src/utils/bad-types.ts(2,3): error TS2322: Type 'number' is not assignable to type 'string'.
```

This correctly fails typecheck because the function declares a `string` return type but returns the number `42`. The task is complete.

