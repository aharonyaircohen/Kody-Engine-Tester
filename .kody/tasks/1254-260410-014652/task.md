# [run-20260410-0144] T01: Simple pluralize utility function

## Task
Add a `pluralize` utility function in `src/utils/pluralize.ts` that handles singular/plural forms.

## Requirements
- `pluralize(word: string, count: number): string` — returns word with 's' appended if count !== 1
- `pluralize('item', 1)` → 'item'
- `pluralize('item', 5)` → 'items'
- `pluralize('cherry', 2, { irregular: { cherry: 'cherries' }})` → 'cherries' (for irregular plurals)
- Add tests in `src/utils/pluralize.test.ts`

## Context
This is a standalone utility function — no dependencies on other modules.

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1254-260410-014652` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24222255053))

To rerun: `@kody rerun 1254-260410-014652 --from <stage>`

