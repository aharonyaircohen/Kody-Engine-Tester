## LearnHub LMS Domain Model

**Core Entities:** `User` (roles: admin/editor/viewer/guest/student/instructor), `Media`, `Course`, `Module`, `Lesson`, `Assignment`, `Submission`, `Discussion`, `Enrollment`, `Note`, `Quiz`, `QuizAttempt`, `Notification`, `Certificate`

**Data Flow:** Client → Next.js Route Handler (`src/app/api/*`) → `withAuth` HOC → Service Layer (`src/services/*`) → Payload Collections → PostgreSQL via `@payloadcms/db-postgres`

**API Surface:**

- `GET/POST /api/notes` — Note CRUD with search
- `GET /api/notes/[id]` — Single note retrieval
- `GET /api/quizzes/[id]` — Quiz retrieval
- `POST /api/quizzes/[id]/submit` — Quiz grading via `QuizGrader`
- `GET /api/quizzes/[id]/attempts` — User's quiz attempts
- `GET /api/courses/search` — Course search with `CourseSearchService` (filters: difficulty, tags, sort: relevance/newest/popularity/rating)
- `POST /api/enroll` — Enrollment (viewer role required)
- `GET /api/gradebook/course/[id]` — Grades per course (editor/admin)

**Auth Architecture:** JWT via `JwtService` (Web Crypto API), sessions in `SessionStore` (in-memory), `withAuth` HOC wraps routes, RBAC via `checkRole` utility

**Key Types:** `Config`, `User`, `Media`, `Note`, `Quiz`, `QuizAnswer`, `QuizQuestion`, `QuizAttempt`, `PayloadGradebookService`, `CourseSearchService`, `Notification`, `NotificationSeverity`, `Schema`, `SchemaError`

**Domain Models:**

- `Notification` (`src/models/notification.ts`): id, recipient, type, severity (info/warning/error), title, message, link?, isRead, createdAt
- `QuizQuestion`: text, type (multiple-choice/true-false/short-answer), options[], correctAnswer?, points
- `Quiz`: id, title, passingScore, maxAttempts, questions[]
- `QuizAnswer`: questionIndex, answer (string|number)
- `QuizAttempt` (`QuizAttempts` collection): user, quiz, score, passed, answers[], startedAt, completedAt
- `GradeOutput`: score, passed, results[], totalPoints, earnedPoints

**Schema Validation (`src/utils/schema.ts`):** Mini-Zod with `Schema`, `SchemaError`, builder `s.string()/number()/boolean()/array()/object()`, `Infer<T>` type inference

**User Fields:** email, firstName, lastName, displayName, avatar?, bio?, role (admin/editor/viewer), organization?, refreshToken?, tokenExpiresAt?, lastTokenUsedAt?, lastLogin?, permissions? (text[])

**Notification Types:** enrollment, grade, deadline, discussion, announcement (from `Notifications` collection)

**Collections:** Users, Media, Courses, Modules, Lessons, Assignments, Submissions, Discussions, Enrollments, Notes, Quizzes, QuizAttempts, Notifications, Certificates
