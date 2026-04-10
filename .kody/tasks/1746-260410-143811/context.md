
### taskify (2026-04-10T14:59:38)
{
  "task_type": "chore",
  "title": "Verify existing implementation of bad-types.ts",
  "description": "The file src/utils/bad-types.ts already exists with the intended content: a function getCount() that declares string return type but returns 42, causing a type error as designed.",
  "scope": ["src/utils/bad-types.ts"],
  "risk_level": "low",
  "existing_patterns": [],
  "questions": []
}


### build (2026-04-10T14:59:59)
The file `src/utils/bad-types.ts` already exists with the intended content:

- `function getCount(): string` — declares return type as `string`
- `return 42` — returns number `42`

This creates a deliberate type mismatch where the function declares it returns a `string` but actually returns the number `42`. This will fail TypeScript's typecheck as designed.

The task is complete — the bad-types.ts file is in place with the intentional type error.

