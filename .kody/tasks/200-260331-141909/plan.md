**Status: Already Complete**

The `slugify` utility function was found fully implemented at `src/utils/slugify.ts` with 18 passing tests at `src/utils/slugify.test.ts`.

**Implementation summary:**
- `src/utils/slugify.ts:8` — `slugify(str: string): string` function
- All task requirements met: lowercase, spaces→hyphens, remove non-alphanumeric (except hyphens), collapse multiple hyphens, trim leading/trailing hyphens
- Bonus: Unicode normalization (accents stripped to ASCII: `café` → `cafe`)

**Test results:** `pnpm test:int -- --run src/utils/slugify.test.ts` — 18 tests, all passing.
