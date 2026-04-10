## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/notes/[id]` — Single note retrieval
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `Notification` (`NotificationSeverity`: info/warning/error), `NotificationFilter`, `SchemaError` (custom validation)

**Database Schema (migrations):**

- `users`: id, email, updated_at, created_at, reset_password_token, reset_password_expiration, salt, hash, login_attempts, lock_until, **lastLogin**, **permissions** (text[])
- `media`: id, alt, url, thumbnail_u_r_l, filename, mime_type, filesize, width, height, focal_x, focal_y
- `users_sessions`: id, \_order, \_parent_id, created_at, expires_at
- `payload_kv`: id, key, data (jsonb)
- `payload_locked_documents`: (，追用於鎖定文檔)

**Schema Utility:** `src/utils/schema.ts` provides mini-Zod with `Schema`, `StringSchema`, `NumberSchema`, `BooleanSchema`, `SchemaError`, `Infer<T>` type helper, and builder methods `.optional()` / `.default()`
