# Payload CMS Collections

Payload collection configs and in-memory store stubs for the LearnHub LMS domain.

## Entry point

Collections are imported into `payload.config.ts` and registered by slug at startup — no lazy loading.

## Load-bearing gotchas

- **Role field mismatch**: `Users.role` uses `admin | editor | viewer`; other collections reference `instructor | admin` roles — verify role checks are consistent before relying on them for access control.
- **Dual auth coexistence**: `UserStore` (SHA-256, in-memory) coexists with `AuthService` (PBKDF2, JWT) — password hashing and user representation differ between the two systems.
- **Store vs. collection**: Several files export both a Payload `CollectionConfig` and a companion `*Store` class (e.g., `CertificatesStore`, `EnrollmentStore`). Stores are in-memory stubs; the Payload collection is the source of truth in production.
- **In-memory seed data**: `EnrollmentStore`, `contactsStore`, and `TaskStore` seed static data at module load time — these IDs (`seed-student-enrolled`, `seed-course-1`, etc.) will not match real Payload-generated IDs.
- **Media upload**: The `media` collection has `upload: true` and is the only collection configured for file uploads.
