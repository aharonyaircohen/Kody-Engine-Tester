## Verdict: PASS

## Summary
Added a recursive `flatten<T>` utility function (`src/utils/flatten.ts`) with 6 tests covering common cases including empty arrays, flat arrays, deeply nested arrays, strings, and mixed types.

## Findings

### Critical
None.

### Major
The generic type `flatten<T>(arr: (T | T[])[])` only handles one level of nesting in the type signature — e.g. `flatten([[1, [2]]])` would require `T = number | number[]` to type correctly, but the runtime behavior handles arbitrary depth. This is a TypeScript limitation and acceptable for a utility function, not a logic error.

### Minor
- The JSDoc comment is present but minimal; the `@param` annotation says "can contain nested arrays" which undersells that it handles arbitrary depth.
- `Array.prototype.flat(Infinity)` is a native alternative that would be simpler, but the recursive implementation is fine for an explicit utility.
