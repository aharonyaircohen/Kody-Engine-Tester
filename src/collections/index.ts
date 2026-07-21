/**
 * @ai-summary Payload CMS collection configs and in-memory stores.
 *
 * Entry point: `payload.config.ts` imports all collection configs directly by name
 * (e.g., `import { Courses } from './collections/Courses'`). There is no barrel export;
 * adding a new collection requires registering it in `payload.config.ts` manually.
 *
 * TRAP — two data-source layers coexist and are easy to confuse:
 *  • Payload collections (e.g. `Courses`, `Lessons`, `Modules`) are the authoritative
 *    persistent store backed by PostgreSQL/MongoDB.
 *  • In-memory stores (e.g. `moduleStore`, `lessonStore`, `enrollmentStore`) are
 *    temporary implementations used in tests and services; they do NOT persist and are
 *    NOT wired to their namesake Payload collections — updates to one do not appear in
 *    the other. Several are explicitly marked "TODO: replace with Payload/DB-backed
 *    collection" in their source.
 *
 * Gotcha: seed data initialized at module-load time (e.g. `enrollmentStore.enroll(...)`)
 * is lost on every server restart. Do not rely on it for any runtime state.
 */
