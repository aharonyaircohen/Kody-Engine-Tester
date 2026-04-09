
### taskify (2026-04-09T20:05:26)
All 7 tests pass. Here's the task classification:

```json
{
  "task_type": "feature",
  "title": "Add toTitleCase utility function",
  "description": "Add a `toTitleCase` utility function in `src/utils/to-title-case.ts` that converts strings to Title Case (e.g., 'hello world' → 'Hello World'). Includes full test coverage in `src/utils/to-title-case.test.ts` with 7 test cases covering basic conversion, single words, empty strings, already-title-cased strings, uppercase input, multiple spaces, an
...(truncated)

### build (2026-04-09T20:05:49)
All 7 tests pass. The `toTitleCase` utility is already implemented in `src/utils/to-title-case.ts` with complete test coverage in `src/utils/to-title-case.test.ts`.

The implementation:
- Handles basic conversion (`hello world` → `Hello World`)
- Handles single words, empty strings, already-title-cased strings
- Lowercases letters after the first (`HELLO WORLD` → `Hello World`)
- Preserves multiple spaces between words
- Handles single-character words

