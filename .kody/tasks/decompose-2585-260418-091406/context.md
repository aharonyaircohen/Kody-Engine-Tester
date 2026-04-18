
### taskify (2026-04-18T09:18:48)
Here's a summary of my research and the proposed plan:

---

**Task: Add `src/utils/configValidator.ts` with tests**

**Exploration findings:**
- `src/utils/` exists with ~100+ single-function utility files, each with co-located `.test.ts`
- **Existing validation patterns to reuse:**
  - `src/utils/schema.ts` — mini-Zod builder (`s.string()`, `s.object()`, etc.) with `SchemaError`
  - `src/utils/result.ts` — `Result<T, E>` discriminated union (`Ok`/`Err` classes)
  - Test patterns from `cache.te
...(truncated)

### build (2026-04-18T09:20:16)
The plan is written to `/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/.kody/tasks/decompose-2585-260418-091406/fuzzy-scribbling-wand.md` and is ready for your review.

**Summary of the plan:**

- **`src/utils/configValidator.ts`** — new schema-driven config validator using existing `s` builder from `schema.ts` and `Result<T, E>` from `result.ts`. Exports `ConfigError`, `validateConfig(raw)`, and `Config` type. Validates 5 optional fields: `noCompose`, `composeFile`, `parallelBuilds`, `
...(truncated)
