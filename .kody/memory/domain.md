## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer), `Media`, `Course`, `Lesson`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification`

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

**Domain Models:**

- `Notification` — id, recipient, type, severity (info/warning/error), title, message, link?, isRead, createdAt
- `Note` — id, title, content, tags[], createdAt, updatedAt

**Security:** `sanitizeHtml` (src/security/sanitizers) applied to user content in notes and course search

**Schema Validation:** Mini-Zod implementation in `src/utils/schema.ts` — `Schema`, `StringSchema`, `NumberSchema`, `BooleanSchema`, `SchemaError` with `optional()` and `default()` modifiers

**Database Migrations:** `src/migrations/` — users table extended with `lastLogin` (timestamp) and `permissions` (text[]) columns via migration `20260405_000000_add_users_permissions_lastLogin`
