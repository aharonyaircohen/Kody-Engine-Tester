# Plan: Add HISTORY note to README.md

## Context
Task `2277-260417-173832` requires adding a HISTORY note line to `README.md` just under the title `# LearnHub LMS`, documenting the provider/model configuration refactor (v0.4.0).

## File to modify
- `/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/README.md`

## Change
Insert the following blockquote line after line 1 (`# LearnHub LMS`):
```
> **HISTORY**: Provider/model configuration has been refactored in v0.4.0 — see [CHANGELOG.md](./CHANGELOG.md) for details.
```

Resulting top of file:
```
# LearnHub LMS

> **HISTORY**: Provider/model configuration has been refactored in v0.4.0 — see [CHANGELOG.md](./CHANGELOG.md) for details.

A full-featured Learning Management System built with Next.js, Payload CMS, and PostgreSQL.
```

## Implementation steps
1. Read `README.md` — confirmed title is on line 1
2. Use `Edit` tool: replace `\n\nA full-featured Learning` (blank line + content after title) with `\n\n> **HISTORY**: Provider/model configuration has been refactored in v0.4.0 — see [CHANGELOG.md](./CHANGELOG.md) for details.\n\nA full-featured Learning`

## Verification
```bash
head -n 6 /home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/README.md
```
Expected: title line, blank line, HISTORY blockquote, blank line, content line.
