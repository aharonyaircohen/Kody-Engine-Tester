## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**Database Migrations:** `src/migrations/` — `20260322_233123_initial` (users, media, sessions tables), `20260405_000000_add_users_permissions_lastLogin` (adds `lastLogin`, `permissions` columns to users)

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/notes/[id]` — Single note retrieval
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `gradeQuiz`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService`, supports `difficulty`, `tags`, `sort` (relevance/newest/popularity/rating), pagination
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility. HTML sanitization via `sanitizeHtml` from `@/security/sanitizers`.

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationSeverity`, `NotificationFilter`, `SortOption`

**Schema/Validation:** Mini-Zod schema builder in `src/utils/schema.ts` — `Schema`, `SchemaError`, `StringSchema`, `NumberSchema`, `BooleanSchema` with `.optional()` and `.default()` modifiers

**Glossary:** viewer=student role; editor=instructor role; guest=unauthenticated; SessionStore=in-memory session storage (not persistent)
