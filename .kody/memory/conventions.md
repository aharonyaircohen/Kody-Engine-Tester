# Conventions

**Multi-tenant LMS**: Organizations contain Users (roles: admin, instructor, student), Courses, Modules, Lessons, Quizzes, Assignments, Enrollments

**Auth Pattern**: JWT tokens with role-based access control

**Data Flow**: Payload CMS collections → PostgreSQL → Next.js API routes → React components

**Code Style**: ESLint + TypeScript strict mode enforced

**See**: README.md for complete domain model and feature roadmap