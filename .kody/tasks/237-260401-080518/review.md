## Verdict: PASS

## Summary

Added a sample utility in `src/utils/sample.ts` with `sample(arr)` returning a random element and `sampleN(arr, n)` returning N random elements without replacement. Tests in `src/utils/sample.test.ts` cover edge cases and correctness.

## Findings

### Critical

None.

### Major

None.

### Minor

`src/utils/sample.ts:19` — `sampleN` uses `sort(() => Math.random() - 0.5)` for shuffling, which is a well-known biased shuffle pattern. For non-security-sensitive random sampling this is acceptable, but a proper Fisher-Yates implementation would be unbiased.

**Suggested fix** (optional — not blocking):
```typescript
export function sampleN<T>(arr: T[], n: number): T[] {
  if (arr.length === 0 || n <= 0) return []
  const result: T[] = []
  const copy = [...arr]
  for (let i = 0; i < Math.min(n, arr.length); i++) {
    const j = i + Math.floor(Math.random() * (copy.length - i))
    result.push(copy[j])
    copy[j] = copy[i]
  }
  return result
}
```

## Two-Pass Review

**Pass 1 — CRITICAL (must fix before merge):**

### SQL & Data Safety
None.

### Race Conditions & Concurrency
None.

### LLM Output Trust Boundary
None.

### Shell Injection
None.

### Enum & Value Completeness
None.

**Pass 2 — INFORMATIONAL (should review, may auto-fix):**

### Conditional Side Effects
None.

### Test Gaps
None — tests are comprehensive for the stated functionality.

### Dead Code & Consistency
None.

### Crypto & Entropy
`sampleN` shuffle bias noted in Minor above — acceptable for non-security use.

### Performance & Bundle Impact
None.

### Type Coercion at Boundaries
None.
