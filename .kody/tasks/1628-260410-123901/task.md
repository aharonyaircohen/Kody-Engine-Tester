# TEST: auto-mode question gate bypass

Add user authentication to the app.

Make it secure and production-ready.

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-10):
@kody run --auto-mode

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `run` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24243047176))

To rerun: `@kody rerun run --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. Should UserStore be removed entirely or kept as a fallback for non-Payload operations?
2. Are there any features still depending on UserStore that would break if removed?
3. Should UserRole ('admin'|'user'|'guest'|'student'|'instructor') be aligned to RbacRole ('admin'|'editor'|'viewer') or vice versa?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1628-260410-123901` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24243254420))

To rerun: `@kody rerun 1628-260410-123901 --from <stage>`

