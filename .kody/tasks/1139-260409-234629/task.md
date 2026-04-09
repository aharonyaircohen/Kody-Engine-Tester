# [mem-20260409-2331] M15: Add audit logger

Create `logAuditEvent(event: { action: string; userId: string; resource: string; details?: string }): void` in `src/services/audit-logger.ts` that appends to a JSONL file. With tests

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `1139-260409-234629` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24218925185))

To rerun: `@kody rerun 1139-260409-234629 --from <stage>`

