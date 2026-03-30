# Architecture

**Stack:** Next.js 16 (App Router) + Payload CMS 3.80 (headless) + PostgreSQL + React 19 + TypeScript

**Purpose:** LearnHub LMS — multi-tenant platform for organizations, instructors, and students to manage courses, lessons, quizzes, assignments, enrollments, and certificates.

**Key Components:**

- **Frontend:** Next.js App Router at `src/app/(frontend)/` with React Server Components
- **Admin Panel:** Payload at `/admin` with custom React components in `src/components/`
- **Database:** PostgreSQL via `@payloadcms/db-postgres` with migrations in `src/migrations/`
- **Auth:** JWT-based (Users collection, roles: admin/instructor/student saved to JWT)
- **Collections:** Users, Courses, Modules, Lessons, Quizzes, Assignments, Enrollments, Certificates, Discussions, Media, Notifications at `src/collections/`
- **Business Logic:** Services in `src/services/` (e.g., discussions, enrollment, certificate generation)
- **Security:** Access control in `src/access/`, sanitizers in `src/security/` (HTML, SQL, URL)
- **API:** Next.js API routes in `src/api/` + Payload Local API

**Data Flow:** Frontend → Next.js API routes → Payload Local API → PostgreSQL ↔ Services (business logic, hooks)

**Testing:** Vitest (integration) at `vitest.config.mts` + Playwright (e2e) at `playwright.config.ts`. Commands: `pnpm test:int`, `pnpm test:e2e`, `pnpm test` (both).

**Key Files:** `src/payload.config.ts` (main config), `tsconfig.json` (baseUrl: ".", path aliases @/\*), `AGENTS.md` (Payload development rules).
