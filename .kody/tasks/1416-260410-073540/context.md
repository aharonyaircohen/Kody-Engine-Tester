
### taskify (2026-04-10T07:38:05)
```json
{
  "task_type": "chore",
  "title": "Create bad-types.ts with intentional type error",
  "description": "Create src/utils/bad-types.ts with a function getCount() that declares return type string but returns 42 (number). This intentionally fails typecheck as part of pipeline testing for !REPEAT_FAIL scenario.",
  "scope": ["src/utils/bad-types.ts"],
  "risk_level": "low",
  "existing_patterns": ["src/utils/sum.ts - simple single-function utility module pattern"],
  "questions": []
}
```


### build (2026-04-10T07:38:57)
The file has been created and the typecheck shows the expected error:

```
src/utils/bad-types.ts(2,3): error TS2322: Type 'number' is not assignable to type 'string'.
```

This confirms `src/utils/bad-types.ts` contains the intentional type error: `getCount()` declares return type `string` but returns `42` (a number).

