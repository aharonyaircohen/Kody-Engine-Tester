# [test-suite] Simple utility function

## Task
Add a `bytesToHuman` utility function in src/utils/ that converts byte counts to human-readable strings (e.g., 1024 → "1 KB", 1048576 → "1 MB").

## Acceptance Criteria
- Export: `export function bytesToHuman(bytes: number): string`
- Handles: bytes, KB, MB, GB, TB (up to petabytes)
- Rounds to 2 decimal places
- Include tests in src/utils/bytes-to-human.test.ts
- Returns "0 B" for 0 bytes
- Pipeline should create PR with LOW complexity label