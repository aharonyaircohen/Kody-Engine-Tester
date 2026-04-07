# [mem-20260407-2007] Add audit logger

Create `logAuditEvent(event: { action: string; userId: string; resource: string; details?: string }): void` in `src/services/audit-logger.ts` that appends to a JSONL file. With tests

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `726-260407-204356` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24103476285))

To rerun: `@kody rerun 726-260407-204356 --from <stage>`

