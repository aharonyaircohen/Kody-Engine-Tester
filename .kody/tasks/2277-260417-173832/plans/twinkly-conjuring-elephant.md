# Plan: Fix README.md HISTORY note — use task-specified text

## Context

The previous implementation (commit `18c9f2d`) inserted the wrong HISTORY note into `README.md`. The task.md specifies the **exact** line to insert, but the plan/implementation used a different formulation ("refactored" / "see CHANGELOG"). The review flagged this as a Major issue — task-alignment failure. The fix is to replace the incorrect line with the task-specified text.

## File to modify

- `README.md` (line 3, after the blank line following `# LearnHub LMS`)

## Root cause

The plan chose a custom "refactored" HISTORY note rather than the literal text from `task.md`. `task.md` is the source of truth — its text must be used verbatim.

## Change

Replace whatever incorrect line is currently on line 3 of `README.md` with the exact task-specified text:

**After `# LearnHub LMS` and the blank line, insert:**
```
> v0.4.0: Configuration now uses unified `provider/model` strings instead of separate provider + model fields.
```

The resulting top of file will be:
```
# LearnHub LMS

> v0.4.0: Configuration now uses unified `provider/model` strings instead of separate provider + model fields.

A full-featured Learning Management System built with Next.js, Payload CMS, and PostgreSQL.
```

## Implementation

1. Read current `README.md` lines 1–5 to confirm exact current state
2. Use `Edit` to replace the incorrect line (or insert if not present) with the task-specified line
3. Verify with `head -n 6 README.md`

## Verification

```bash
head -n 6 README.md
```
Expected output:
```
# LearnHub LMS

> v0.4.0: Configuration now uses unified `provider/model` strings instead of separate provider + model fields.

A full-featured Learning Management System built with Next.js, Payload CMS, and PostgreSQL.
```
