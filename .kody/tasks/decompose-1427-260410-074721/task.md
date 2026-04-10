# [run-20260410-0744] T22: Taskify context injection

## Purpose
Test that taskify receives project context (memory + file tree) instead of operating in a vacuum.

## Setup
Ensure .kody/memory.md exists in the tester repo with project conventions before triggering.

## Command
@kody taskify --file docs/test-prd.md

## Expected
- Project memory content appears in taskify stage logs
- File tree (git ls-files output) appears in taskify stage logs
- No raw {{ }} template tokens in taskify logs

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody decompose

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `decompose-1427-260410-074721` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24232471861))

To rerun: `@kody rerun decompose-1427-260410-074721 --from <stage>`

