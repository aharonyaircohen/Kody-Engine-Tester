## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `Certificate`, `Assignment`, `Submission`, `Quiz`, `QuizAttempt`, `Notification`, `Note`, `Discussion`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → Middleware chain (rate-limiter → request-logger → auth-middleware → role-guard → validation) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

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

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationSeverity`, `Schema`, `SchemaError`

**Glossary:** `viewer` = student role; `editor` = instructor role; `withAuth` = route protection HOC; `PayloadGradebookService` = grade aggregation per student/course; `CourseSearchService` = course filtering/sorting; `QuizGrader` = auto-grading engine; `Payload kv` = key-value store for sessions/locks; `MigrateUpArgs/MigrateDownArgs` = Payload migration interface
