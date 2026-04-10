
### taskify (2026-04-10T16:29:15)
{
  "task_type": "chore",
  "title": "Verify existing implementation of bad-types.ts",
  "description": "File `src/utils/bad-types.ts` already exists with the intended content: a `getCount()` function declared to return `string` but returning `42` (number). This will fail TypeScript type checking as intended.",
  "scope": ["src/utils/bad-types.ts"],
  "risk_level": "low",
  "existing_patterns": [],
  "questions": []
}


### build (2026-04-10T16:29:47)
The implementation is verified. The file `src/utils/bad-types.ts` contains:

```typescript
export function getCount(): string {
  return 42;  // Type error: number is not assignable to string
}
```

The TypeScript compiler correctly reports the type error at line 2: `Type 'number' is not assignable to type 'string'`.

The task is complete - the intentional wrong return type has been implemented and verified to fail type checking.

