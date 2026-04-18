# QA Guide

## Quick Reference

- **Dev server:** `pnpm dev` at `http://localhost:3000`
- **Login page:** `/login`
- **Admin panel:** `/admin/:...segments?`

## Authentication

### Test Accounts

| Role       | Email                 | Password                 |
| ---------- | --------------------- | ------------------------ |
| Admin      | `QA_ADMIN_EMAIL`      | `QA_ADMIN_PASSWORD`      |
| Engineer   | `QA_ENGINEER_EMAIL`   | `QA_ENGINEER_PASSWORD`   |
| CEO        | `QA_CEO_EMAIL`        | `QA_CEO_PASSWORD`        |
| CTO        | `QA_CTO_EMAIL`        | `QA_CTO_PASSWORD`        |
| Researcher | `QA_RESEARCHER_EMAIL` | `QA_RESEARCHER_PASSWORD` |

### Login Steps

1. Navigate to `/login`
2. Enter email and password from test accounts table
3. Submit form
4. Verify redirect to `/dashboard`

### Auth Files

- `src/auth/index.ts`
- `src/auth/jwt-service.ts`
- `src/auth/session-store.ts`
- `src/auth/user-store.ts`
- `src/auth/withAuth.ts`
- `src/middleware/auth-middleware.ts`
- `src/middleware/role-guard.ts`

## Roles

`admin`, `Engineer`, `CEO`, `CTO`, `Researcher`

## Navigation Map

### Frontend Pages

| Path                           | Expected Content     | Key Interactions                     |
| ------------------------------ | -------------------- | ------------------------------------ |
| `/`                            | Home page            | Verify navigation links render       |
| `/dashboard`                   | Dashboard with stats | Verify role-specific content loads   |
| `/instructor/courses/:id/edit` | Course editor        | Fill title/slug fields, save changes |
| `/notes`                       | Notes list           | Verify list renders with pagination  |
| `/notes/create`                | Note creation form   | Fill title/content/tags, submit      |
| `/notes/:id`                   | Note detail view     | Verify content displays              |
| `/notes/edit/:id`              | Note edit form       | Modify fields, save                  |

### Admin Panel

| Path                               | Elements          | Key Fields                                                                                       |
| ---------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------ |
| `/admin/collections/assignments`   | Assignment list   | title, module, dueDate, maxScore                                                                 |
| `/admin/collections/courses`       | Course list/edit  | title, slug, description, thumbnail, instructor, status, difficulty, estimatedHours, tags, label |
| `/admin/collections/enrollments`   | Enrollment list   | student, course, enrolledAt, status                                                              |
| `/admin/collections/lessons`       | Lesson list       | title, course, module, order, type, content                                                      |
| `/admin/collections/media`         | Media list        | alt                                                                                              |
| `/admin/collections/notifications` | Notification list | recipient, type, title, message, isRead                                                          |
| `/admin/collections/quiz-attempts` | Quiz attempt list | user, quiz, score, passed, startedAt                                                             |
| `/admin/collections/quizzes`       | Quiz list         | title, module, passingScore, timeLimit, maxAttempts                                              |
| `/admin/collections/submissions`   | Submission list   | assignment, student, status, grade                                                               |
| `/admin/collections/users`         | User list         | firstName, lastName, role, organization                                                          |
| `/admin/collections/certificates`  | Certificate list  | student, course, issuedAt, certificateNumber                                                     |
| `/admin/collections/notes`         | Notes list        | title, content, tags                                                                             |

### API Endpoints

| Path                          | Methods          | Purpose                   |
| ----------------------------- | ---------------- | ------------------------- |
| `/api/enroll`                 | POST             | Enroll user in course     |
| `/api/gradebook`              | GET              | Get gradebook data        |
| `/api/gradebook/course/:id`   | GET              | Get course grades         |
| `/api/notifications`          | GET, POST        | List/create notifications |
| `/api/notifications/:id/read` | POST             | Mark notification read    |
| `/api/notifications/read-all` | POST             | Mark all read             |
| `/api/quizzes/:id`            | GET              | Get quiz                  |
| `/api/quizzes/:id/submit`     | POST             | Submit quiz               |
| `/api/quizzes/:id/attempts`   | GET              | Get quiz attempts         |
| `/api/courses/search`         | GET              | Search courses            |
| `/api/notes`                  | GET, POST        | List/create notes         |
| `/api/notes/:id`              | GET, PUT, DELETE | CRUD single note          |
| `/api/dashboard/admin-stats`  | GET              | Admin dashboard stats     |
| `/api/health`                 | GET              | Health check              |

## Component Verification Patterns

### Admin Collection List

1. Navigate to `/admin/collections/:slug`
2. Verify table renders with columns matching collection fields
3. Click row to open edit view
4. Verify form fields match collection schema

### Admin Edit Form

1. Navigate to `/admin/collections/:slug/:id`
2. Verify all fields render with correct values
3. Modify field and save
4. Verify success toast and data persists

### Notes CRUD (Frontend)

1. Navigate to `/notes` — verify list renders
2. Click `/notes/create` — fill title, content, tags
3. Submit — verify redirect to note detail
4. Click edit — modify and save
5. Verify changes reflected in detail view

### Dashboard

1. Navigate to `/dashboard`
2. Verify role-specific cards/sections render
3. Verify statistics load without errors

## Common Test Scenarios

### Admin Collection CRUD

1. Create: Navigate to collection list → click "Create" → fill required fields → save → verify in list
2. Read: Click existing item → verify detail view loads
3. Update: Edit item → modify fields → save → verify changes
4. Delete: Select item → delete → verify removed from list

### Login Flow

1. Visit `/login` → enter invalid creds → verify error message
2. Enter valid admin creds → submit → verify redirect to `/dashboard`
3. Verify admin-specific content visible (e.g., admin stats)

### Course Edit (Instructor)

1. Navigate to `/instructor/courses/:id/edit`
2. Verify course fields pre-populate
3. Modify title/description → save
4. Verify success feedback

## Environment Setup

```
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=your-secret-here
QA_ADMIN_EMAIL=admin@example.com
QA_ADMIN_PASSWORD=CHANGE_ME
QA_ENGINEER_EMAIL=engineer@example.com
QA_ENGINEER_PASSWORD=CHANGE_ME
QA_CEO_EMAIL=ceo@example.com
QA_CEO_PASSWORD=CHANGE_ME
QA_CTO_EMAIL=cto@example.com
QA_CTO_PASSWORD=CHANGE_ME
QA_RESEARCHER_EMAIL=researcher@example.com
QA_RESEARCHER_PASSWORD=CHANGE_ME
```

## Dev Server

```bash
pnpm dev
# Runs at http://localhost:3000
```

## Rules

- Use Playwright `page.goto()` with exact URLs from Navigation Map
- Verify page titles and visible text with `expect(page.locator('text=...')).toBeVisible()`
- Fill forms using `page.fill('input[name="..."]', 'value')` or `page.selectOption()`
- Wait for navigation after form submissions with `page.waitForURL()`
- Use `page.click()` on buttons/links, `page.dblclick()` on drag handles
- For drag-and-drop: `page.dragAndDrop('[data-drag-handle]', '[data-drop-target]')`
