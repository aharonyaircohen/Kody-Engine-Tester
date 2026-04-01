
### build (2026-04-01T22:13:58)
The implementation is complete:

**Created files:**
- `src/utils/interpolate.ts` - the utility function
- `src/utils/interpolate.test.ts` - 8 unit tests

**Implementation details:**
- `interpolate('Hello, {name}!', { name: 'World' })` returns `'Hello, World!'`
- Supports `{key}` placeholder syntax
- Handles string and number values
- Leaves unmatched placeholders unchanged
- Handles repeated placeholders, consecutive placeholders, and templates with no placeholders

**Verification:**
- All 8 tes
...(truncated)
