# Notification System PRD

## Overview

Implement a notification system for LearnHub LMS that allows instructors and admins to send notifications to students.

## Tasks

### Task 1: Notification Types
**Priority:** HIGH
**Dependencies:** None

Define the notification type system with the following notification types:
- `enrollment` - Course enrollment notifications
- `grade` - Grade posted notifications
- `announcement` - Course announcements
- `deadline` - Assignment deadline reminders

**Test Strategy:**
- Unit test notification type enum values
- Verify all 4 types are supported

---

### Task 2: Notification Service
**Priority:** HIGH
**Dependencies:** Task 1 (Notification Types)

Build the notification service that handles:
- Creating notifications with type and recipient
- Storing notifications in the database
- Querying user notifications

**Test Strategy:**
- Integration test notification creation
- Test notification querying by user

---

### Task 3: Notification API Routes
**Priority:** MEDIUM
**Dependencies:** Task 2 (Notification Service)

Create API routes for:
- `GET /api/notifications` - List user notifications
- `POST /api/notifications` - Create a notification
- `PATCH /api/notifications/:id/read` - Mark notification as read

**Test Strategy:**
- E2E test API endpoints with authentication
- Verify role-based access control