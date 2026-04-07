## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification` (src/models/notification.ts:9)

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET/POST /api/notes/[id]` — Single note CRUD
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `gradeQuiz` (src/app/api/quizzes/[id]/submit/route.ts)
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Schema Validation:** `SchemaError`, `StringSchema`, `NumberSchema`, `BooleanSchema` (src/utils/schema.ts) — mini-Zod type inference via `Infer<T>` and `_type`

**Database Schema (via migrations):**

- `users`: id, email, reset_password_token/expiration, salt, hash, login_attempts, lock_until, lastLogin, permissions (text[])
- `users_sessions`: \_order, \_parent_id, id, created_at, expires_at
- `media`: id, alt, url, thumbnail_u_r_l, filename, mime_type, filesize, width, height, focal_x, focal_y
- `payload_kv`: key, data (jsonb)
- `payload_locked_documents`: for document locking

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `SortOption` (src/services/course-search.ts), `Notification`, `NotificationSeverity`, `NotificationFilter` (src/models/notification.ts:1-14)
