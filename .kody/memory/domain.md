## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification` (severity: info/warning/error)

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET/POST /api/notes/[id]` — Single note operations
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService` (sort: relevance/newest/popularity/rating; difficulty: beginner/intermediate/advanced)
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Schema Validation:** Custom mini-Zod at `src/utils/schema.ts` (`Schema`, `StringSchema`, `NumberSchema`, `BooleanSchema`, `SchemaError`)

**Security:** HTML sanitization via `sanitizeHtml` from `@/security/sanitizers`

**Database Migrations:** `20260322_233123_initial` (users_sessions, users, media, payload_kv, payload_locked_documents), `20260405_add_users_permissions_lastLogin` (adds `lastLogin` timestamp and `permissions` text[] to users)

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `QuizAttempt`, `Notification`, `NotificationFilter`, `PayloadGradebookService`, `CourseSearchService`, `SortOption`
