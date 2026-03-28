# Architecture

**LearnHub** is a multi-tenant Learning Management System built with modern web technologies.

- **Frontend**: Next.js 16 (App Router) with React 19 Server Components
- **Backend**: Payload CMS 3.80 (headless, admin at `/admin`)
- **Database**: PostgreSQL via `@payloadcms/db-postgres`
- **Auth**: JWT-based with role guards (student, instructor, admin)
- **Rich Text**: Lexical editor for lesson content
- **Media**: Sharp for image processing, file uploads via Payload

**Domain**: Organizations manage courses (modules → lessons/quizzes/assignments), students enroll and track progress, instructors grade submissions and manage discussions.

**Key Directories**:
- `src/api`: Payload collections and API endpoints
- `src/app`: Next.js App Router pages
- `src/auth`: JWT and middleware
- `src/collections`: Payload CMS collection definitions
- `src/components`: React components
- `src/middleware`: Request handlers (rate limiting, auth)

**Data Flow**: Client → Next.js API routes → Payload CMS → PostgreSQL

**Testing**: Vitest (unit/integration), Playwright (e2e)