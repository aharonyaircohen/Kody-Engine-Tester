## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Assignment`, `Notification` (severity: info/warning/error), `Certificate`, `Discussion`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search (`sanitizeHtml` sanitization)
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader` (`Quiz`, `QuizAnswer` types)
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService` (sort: relevance/newest/popularity/rating)
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin) via `PayloadGradebookService`

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `Notification`, `NotificationSeverity`, `NotificationFilter`, `PayloadGradebookService`, `CourseSearchService`, `SortOption`

**Database:** PostgreSQL — tables: `users` (lastLogin, permissions cols), `users_sessions`, `media`, `payload_kv`, `payload_locked_documents`; migrations timestamped in `src/migrations/`

**Utilities:** `SchemaError` custom schema validation (`src/utils/schema.ts`); `sanitizeHtml` for XSS prevention (`src/security/sanitizers`)
