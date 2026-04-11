**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationSeverity`, `NotificationFilter`

**Database Schema (via migrations):**

- `users` table: `id`, `updated_at`, `created_at`, `email`, `reset_password_token`, `reset_password_expiration`, `salt`, `hash`, `login_attempts`, `lock_until`, `lastLogin`, `permissions`
- `users_sessions` table: `_order`, `_parent_id`, `id`, `created_at`, `expires_at`
- `media` table: standard Payload media fields (url, thumbnail_url, filename, mime_type, filesize, width, height, focal_x, focal_y)
- `payload_kv`, `payload_locked_documents` — Payload internal tables

**Utilities:** `Schema` class (`src/utils/schema.ts`) — mini-Zod type inference schema builder with `StringSchema`, `NumberSchema`, `BooleanSchema`, `SchemaError`; `sanitizeHtml` (`src/security/sanitizers`) for XSS prevention
