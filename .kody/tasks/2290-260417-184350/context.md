
### taskify (2026-04-17T18:48:09)
I've completed the taskify classification. Here's a summary:

**Task Classification (JSON output):**

```json
{
  "task_type": "feature",
  "title": "Add capitalize string utility in src/utils/strings.ts with tests",
  "description": "Create a new capitalize utility function in src/utils/strings.ts that capitalizes the first character of a string, and a co-located test file src/utils/strings.test.ts using vitest. The task is a simple feature addition used to verify that the Kody decompose pipeli
...(truncated)

### build (2026-04-17T18:51:00)
The plan is ready. It calls for creating two files:

- **`src/utils/strings.ts`** — a `capitalize(str)` function that uppercases only the first character and returns `''` for falsy inputs
- **`src/utils/strings.test.ts`** — vitest tests covering lowercase words, uppercase words, single chars, empty strings, non-letter prefixes, null/undefined, leading spaces, and whitespace-only strings

Both follow the exact patterns observed in `reverse.ts`/`reverse.test.ts` and `omit.ts`/`omit.test.ts`. Ready
...(truncated)
