# Add clamp utility function

## Task
Add a `clamp` utility function in `src/utils/clamp.ts` that constrains a number within a min/max range.

## Acceptance Criteria
- Export: `export function clamp(value: number, min: number, max: number): number`
- Returns `min` if value < min
- Returns `max` if value > max
- Returns `value` if within range
- Include tests in `src/utils/clamp.test.ts`