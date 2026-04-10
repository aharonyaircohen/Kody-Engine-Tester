# [mem-20260410-0022] M15: Add audit logger

Create `logAuditEvent(event: { action: string; userId: string; resource: string; details?: string }): void` in `src/services/audit-logger.ts` that appends to a JSONL file. With tests

---

## Discussion (5 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1233-260410-010909` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24221269457))

To rerun: `@kody rerun 1233-260410-010909 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. What should be the path/location of the JSONL log file (e.g., `logs/audit.jsonl`, `data/audit.jsonl`, or a configurable path)?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
@kody approve

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1233-260410-010909` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24221401848))

To rerun: `@kody rerun 1233-260410-010909 --from <stage>`

