## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `gradeQuiz`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationSeverity`

**Domain Models:** `src/models/notification.ts` — `Notification`, `NotificationFilter`; `src/utils/bad-types.ts` — `getCount`

**Schema Utilities:** `src/utils/schema.ts` — `Schema`, `SchemaError`, `StringSchema`, `NumberSchema`, `BooleanSchema` with `optional()` and `default()` modifiers

**Migrations:** `src/migrations/20260322_233123_initial` (users, media, sessions tables), `src/migrations/20260405_000000_add_users_permissions_lastLogin` (adds `lastLogin` and `permissions` columns to users)

**Security:** `sanitizeHtml` in `src/security/sanitizers`; rate limiting middleware; role guards via `checkRole`

**Quiz Grading:** `src/services/quiz-grader` exports `gradeQuiz`, `Quiz`, `QuizAnswer` types

**Search:** `CourseSearchService` in `src/services/course-search` with `SortOption` type; validates `difficulty`, `tags`, `sort` params; max limit 100
