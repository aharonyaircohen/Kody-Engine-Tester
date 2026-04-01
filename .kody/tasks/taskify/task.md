# [test-suite] Taskify context injection

Test that `@kody taskify` injects project memory and file tree into its context. A `.kody/memory.md` file with tRPC/Prisma conventions has been added to the repo. This validates that the memory content and file tree appear in taskify stage logs and that no raw `{{` template tokens appear.