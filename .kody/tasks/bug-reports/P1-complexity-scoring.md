# [P1] Complexity scoring produces inconsistent/deterministic results

## Severity
P1 - High

## Summary
The complexity scoring system produces different scores for the same code on different runs, making it unreliable for task routing decisions.

## Impact
- Same task may be routed differently on each run
- Inconsistent difficulty classification
- Unpredictable pipeline behavior

## Evidence
From Memory Benchmark Report (mem-20260410-1027):
- M01, M02, M03 ran with inconsistent results
- Only MF2 (wrong return type) behaved predictably
- Intentional failures did not fail as expected

## Root Cause
Complexity scoring likely uses non-deterministic operations:
1. Hash maps with random iteration order
2. Time-based scoring
3. Unseeded random number generation

## Suggested Fix
1. Make complexity scoring deterministic with seeded random
2. Use stable sort for code structure analysis
3. Cache complexity scores for identical code

## Labels
- bug
- p1
- complexity
- scoring