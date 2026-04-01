# [test-suite] Taskify file mode

Test the `@kody taskify` command with a PRD file. This validates priority labels, Test Strategy sections, and topological ordering of sub-issues.

The PRD is at `docs/test-prd.md` and defines 3 tasks for a notification system with clear dependencies:
1. Notification types (no deps)
2. Notification service (depends on types)
3. Notification API routes (depends on service)