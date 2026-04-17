## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Module`, `Lesson`, `Enrollment`, `Certificate`, `Assignment`, `Submission`, `Note`, `Quiz`, `QuizAttempt`, `Notification`, `Contact`, `Discussion`

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

**Key Types:** `Config`, `User`, `Media`, `Note`, `Notification` (`NotificationSeverity: info|warning|error`), `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `CourseSearchService`

**Schema Validation:** Mini-Zod schema builder in `src/utils/schema.ts` — `SchemaError`, `StringSchema`, `NumberSchema`, `BooleanSchema` with `parse()`, `optional()`, `default()` methods

**Database Migrations:** `src/migrations/20260322_233123_initial` (users, media, sessions, locked_docs), `src/migrations/20260405_000000_add_users_permissions_lastLogin` (adds `lastLogin` timestamp and `permissions` text[] to users)

**Security:** Input sanitization via `sanitizeHtml` (`src/security/sanitizers`), CSRF token handling (`src/security/csrf-token`), middleware stack in `src/middleware/` (auth, role-guard, csrf, rate-limiter, request-logger, validation)
