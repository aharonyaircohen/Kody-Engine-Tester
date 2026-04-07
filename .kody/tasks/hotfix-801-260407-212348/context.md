
### build (2026-04-07T21:27:12)
The fix is complete. I've created `src/utils/array-last.ts` with:
- A named export `export function arrayLast<T>(arr: T[]): T | undefined`
- A default export `export default arrayLast`

This follows the same pattern as other utility files in `src/utils/` (e.g., `reverse.ts`, `unique.ts`).

The file:
- Compiles correctly with TypeScript
- Passes lint (no errors in the file itself)
- Returns the last element of an array, or `undefined` for empty arrays

