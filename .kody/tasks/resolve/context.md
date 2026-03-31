
### taskify (2026-03-31T14:07:57)
**Task completed.**

Created:
- `src/utils/capitalize-words.ts` - `capitalizeWords(str: string): string` function
- `src/utils/capitalize-words.test.ts` - 7 unit tests

Verification:
- Tests: 7/7 passed
- Lint: no errors
- Typecheck: errors are pre-existing in other files (auth-context, event-emitter, pipe), not in the new files


### build (2026-03-31T14:09:29)
The `capitalizeWords` utility is already implemented and working:

**Files:**
- `src/utils/capitalize-words.ts` - Implementation
- `src/utils/capitalize-words.test.ts` - 7 unit tests

**Verification:**
- All 7 tests pass
- No type errors in the new files
- Pre-existing type errors in other files (auth-context, event-emitter, pipe) are unrelated

The task is complete. The implementation capitalizes the first letter of each word while lowercasing the rest, handles empty strings, already-capitalize
...(truncated)
