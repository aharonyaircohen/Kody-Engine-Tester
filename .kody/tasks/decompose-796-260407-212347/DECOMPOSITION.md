# Notification System Decomposition

## Overview
The notification system spans **10 files across 4 directories**, following a layered architecture pattern.

## Decomposition by Layer

### 1. Model Layer (`src/models/`)
- **File**: `src/models/notification.ts`
- **Purpose**: Domain types and interfaces
- **Components**:
  - `NotificationSeverity` type (`'info' | 'warning' | 'error'`)
  - `Notification` interface (id, recipient, type, severity, title, message, link, isRead, createdAt)
  - `NotificationFilter` interface for filtering criteria

### 2. Service Layer (`src/services/`)
- **Files**:
  - `src/services/notifications.ts` - `NotificationService` class
  - `src/services/notifications.test.ts` - 5 tests
- **Purpose**: Business logic and Payload CMS integration
- **Components**:
  - `notify()` - Create new notification
  - `getUnread()` - Fetch unread notifications for user
  - `markRead()` - Mark single notification as read
  - `markAllRead()` - Mark all user notifications as read

### 3. Utility Layer (`src/utils/`)
- **Files**:
  - `src/utils/notificationHelpers.ts` - Pure utility functions
  - `src/utils/notificationHelpers.test.ts` - 13 tests
- **Purpose**: Formatting, filtering, and sorting utilities
- **Components**:
  - `formatNotification()` - Format notification as readable string
  - `filterNotifications()` - Filter by severity, isRead, recipientId
  - `getUnreadCount()` - Count unread notifications
  - `sortBySeverity()` - Sort by severity (error > warning > info)

### 4. API Route Layer (`src/app/api/notifications/`)
- **Files**:
  - `src/app/api/notifications/route.ts` - GET unread notifications
  - `src/app/api/notifications/read-all/route.ts` - POST mark all read
  - `src/app/api/notifications/[id]/read/route.ts` - PATCH mark single read
- **Purpose**: REST API endpoints with JWT authentication via `withAuth`
- **Pattern**: Uses `withAuth` HOC for route protection

### 5. Legacy Route Adapter (`src/routes/`)
- **File**: `src/routes/notifications.ts`
- **Purpose**: Backwards-compatible route adapter

### 6. Payload Collection (`src/collections/`)
- **File**: `src/collections/Notifications.ts`
- **Purpose**: Payload CMS collection configuration

## Sub-Tasks (2+)

| # | Sub-Task | Files | Description |
|---|----------|-------|-------------|
| 1 | Notification Model & Types | `src/models/notification.ts` | Type definitions for domain model |
| 2 | Notification Service | `src/services/notifications.ts`, `src/services/notifications.test.ts` | Payload-based CRUD operations |
| 3 | Notification Utilities | `src/utils/notificationHelpers.ts`, `src/utils/notificationHelpers.test.ts` | Formatting, filtering, sorting helpers |
| 4 | API Routes | `src/app/api/notifications/**/*.ts`, `src/routes/notifications.ts` | REST endpoints with auth |

## Test Coverage
- **Total Tests**: 18 passing
  - Service layer: 5 tests
  - Utility helpers: 13 tests

## Architecture Pattern
```
API Route (withAuth) → Service (NotificationService) → Payload Collection → PostgreSQL
                                                    ↓
                                            Utilities (notificationHelpers)
```