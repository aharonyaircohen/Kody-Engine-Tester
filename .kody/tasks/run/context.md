
### taskify (2026-04-07T12:02:32)
{"task_type":"feature","title":"Add bytesToHuman utility function","description":"Add a `bytesToHuman` utility function in src/utils/bytes-to-human.ts that converts byte counts to human-readable strings. Must handle bytes up to petabytes (PB), round to 2 decimal places, and return '0 B' for 0 bytes. Include co-located tests in src/utils/bytes-to-human.test.ts. Export signature: `export function bytesToHuman(bytes: number): string`","scope":["src/utils/bytes-to-human.ts","src/utils/bytes-to-human
...(truncated)

### build (2026-04-07T12:05:30)
The TypeScript errors are pre-existing in the codebase and unrelated to my changes. My implementation is complete:

**Created files:**
- `src/utils/bytes-to-human.ts` - Utility function that converts bytes to human-readable strings
- `src/utils/bytes-to-human.test.ts` - Co-located tests (8 tests passing)

**Implementation details:**
- Handles bytes up to petabytes (B, KB, MB, GB, TB, PB)
- Returns "0 B" for 0 bytes
- Rounds to 2 decimal places
- Uses 1024 as the conversion factor (binary units)

