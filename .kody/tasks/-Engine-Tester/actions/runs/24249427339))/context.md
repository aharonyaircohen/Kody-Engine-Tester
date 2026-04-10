
### taskify (2026-04-10T15:06:34)
{
  "task_type": "chore",
  "title": "Verify existing implementation of bad-types.ts",
  "description": "File src/utils/bad-types.ts already exists with the function getCount(): string { return 42 } as specified. Verified implementation matches task requirements.",
  "scope": ["src/utils/bad-types.ts"],
  "risk_level": "low",
  "existing_patterns": [],
  "questions": []
}


### build (2026-04-10T15:07:09)
**Verification complete.** The file `src/utils/bad-types.ts` exists with the exact implementation specified in the task:

```typescript
export function getCount(): string {
  return 42;
}
```

The TypeScript error confirms the intentional type mismatch:
```
src/utils/bad-types.ts(2,3): error TS2322: Type 'number' is not assignable to type 'string'.
```

The implementation is correct — the function declares return type `string` but returns the number `42`, which will fail typecheck as designed fo
...(truncated)
