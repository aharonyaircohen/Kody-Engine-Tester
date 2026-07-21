/**
 * @ai-summary
 * Payload CMS collection configs and in-memory store shims for the LearnHub LMS domain.
 *
 * **Entry point:** `payload.config.ts` imports all collections from this directory.
 *
 * **Load-bearing gotcha — store vs. collection divergence:** Several files export both a
 * Payload `CollectionConfig` (used by the CMS admin panel) and a companion in-memory
 * store class (used at runtime by services). These two representations are not
 * automatically kept in sync — any schema change to a collection config must be
 * manually propagated to the corresponding store, or the runtime layer will drift.
 *
 * **Files with dual store+collection:** Modules.ts, Lessons.ts.
 *
 * **Store-only files (no Payload persistence — migrate when DB is wired):**
 * contacts.ts, NotificationsStore.ts, tasks.ts, Discussions.ts, EnrollmentStore.ts.
 */
