# Add truncate string utility

## Task
Create a `truncate` utility function in `src/utils/strings.ts`.

## Acceptance Criteria
- Export: `truncate(str: string, maxLen: number, suffix?: string): string`
- Default suffix is "..."
- If string is shorter than maxLen, return unchanged
- Include unit test in `src/utils/strings.test.ts`