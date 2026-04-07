## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification` (with `NotificationSeverity`: info/warning/error), `users_sessions`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**Database Schema:**

- `users` — id, email, hash, salt, reset_password_token, login_attempts, lock_until, lastLogin, permissions (text[])
- `users_sessions` — \_order, \_parent_id, id, created_at, expires_at
- `media` — id, alt, url, thumbnail_u_r_l, filename, mime_type, filesize, width, height, focal_x, focal_y
- `payload_kv` — key/value store for key-value data
- `payload_locked_documents` — locked document tracking

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationFilter`, `NotificationSeverity`

**Utilities:** `Schema` class (mini-Zod, `src/utils/schema.ts`) with `StringSchema`, `NumberSchema`, `BooleanSchema` — supports `.optional()` and `.default()` modifiers, throws `SchemaError` on validation failure
