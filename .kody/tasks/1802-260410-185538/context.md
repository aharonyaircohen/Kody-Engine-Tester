
### taskify (2026-04-10T18:58:14)
{
  "task_type": "chore",
  "title": "Verify existing implementation of bad-types.ts",
  "description": "The file src/utils/bad-types.ts already exists with the required content: function getCount(): string { return 42 }. This is an intentional type error that will fail typecheck.",
  "scope": ["src/utils/bad-types.ts"],
  "risk_level": "low",
  "existing_patterns": [],
  "questions": []
}


### build (2026-04-10T18:58:48)
**Verification complete.** The file `src/utils/bad-types.ts` exists with the required content:

```typescript
export function getCount(): string {
  return 42;
}
```

Typecheck confirms the intentional type error:
```
src/utils/bad-types.ts(2,3): error TS2322: Type 'number' is not assignable to type 'string'.
```

The function declares return type `string` but returns `42` (a number), which will fail typecheck as expected per the task requirements.

