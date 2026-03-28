# Architecture

**LearnHub LMS** — A multi-tenant Learning Management System built with Next.js App Router, Payload CMS (headless), and PostgreSQL.

## Stack
- **Frontend**: Next.js 16.2.1 (App Router) + React 19 + TypeScript (strict mode)
- **Backend/CMS**: Payload CMS 3.80.0 (headless admin panel at `/admin`)
- **Database**: PostgreSQL via `@payloadcms/db-postgres`
- **Auth**: JWT-based with role guards (admin, instructor, student)
- **Rich Text**: Lexical editor for lesson content
- **Testing**: Vitest (unit/integration), Playwright (e2e)
- **Code Quality**: ESLint, Prettier, TypeScript compiler

## Domain Model
Organization (tenant) → Users (roles) → Courses (Modules → Lessons/Quizzes/Assignments) → Enrollments, Certificates, Gradebook, Discussions

## Key Directories
- `src/api` — API routes
- `src/app` — Next.js pages and layouts
- `src/auth` — JWT auth logic and middleware
- `src/collections` — Payload CMS collection definitions
- `src/components` — React components
- `src/hooks`, `src/contexts` — State management
- `src/middleware` — Auth and rate limiting
- `src/migrations` — Database migrations
- `src/services` — Business logic
- `src/validation` — Input validation schemas