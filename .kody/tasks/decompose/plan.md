Now I have enough context. Let me write the plan.

## Existing Patterns Found

- **Utility module pattern** (`src/utils/group-by.ts`, `src/utils/format-number.ts`): Single-responsibility files with typed interfaces, JSDoc comments, and `@example` sections
- **Service pattern** (`src/services/notifications.ts`): Class-based with Payload dependency, returns typed results
- **API route pattern** (`src/app/api/notifications/route.ts`): Uses `withAuth` HOC, returns `Response` with JSON
- **Test pattern** (`src/services/notifications.test.ts`): `vi.fn()` mocks, `describe/it` blocks

---

## Step 1: Create notification model types

**File:** `src/models/notification.ts`
**Change:** Create new file with notification domain types (info, warning, error) and read/unread status interface

```typescript
export type NotificationSeverity = 'info' | 'warning' | 'error'

export interface Notification {
  id: string
  recipient: string
  type: string
  severity: NotificationSeverity
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: Date
}

export interface NotificationFilter {
  severity?: NotificationSeverity
  isRead?: boolean
  recipientId?: string
}
```

**Verify:** `pnpm tsc --noEmit` passes

---

## Step 2: Create notificationHelpers utility

**File:** `src/utils/notificationHelpers.ts`
**Change:** Create formatting and filtering helpers

```typescript
import type { Notification, NotificationFilter, NotificationSeverity } from '@/models/notification'

export function formatNotification(notification: Notification): string {
  return `[${notification.severity.toUpperCase()}] ${notification.title}: ${notification.message}`
}

export function filterNotifications(
  notifications: Notification[],
  filter: NotificationFilter
): Notification[] {
  return notifications.filter(n => {
    if (filter.severity !== undefined && n.severity !== filter.severity) return false
    if (filter.isRead !== undefined && n.isRead !== filter.isRead) return false
    if (filter.recipientId !== undefined && n.recipient !== filter.recipientId) return false
    return true
  })
}

export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter(n => !n.isRead).length
}

export function sortBySeverity(notifications: Notification[]): Notification[] {
  const order: Record<NotificationSeverity, number> = { error: 0, warning: 1, info: 2 }
  return [...notifications].sort((a, b) => order[a.severity] - order[b.severity])
}
```

**Verify:** `pnpm tsc --noEmit` passes

---

## Step 3: Create unit tests for notificationHelpers

**File:** `src/utils/notificationHelpers.test.ts`
**Change:** Add vitest tests following existing pattern (`vi.fn()`, `describe/it`)

```typescript
import { describe, it, expect } from 'vitest'
import { formatNotification, filterNotifications, getUnreadCount, sortBySeverity } from './notificationHelpers'
import type { Notification } from '@/models/notification'

const mockNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: '1',
  recipient: 'user-1',
  type: 'enrollment',
  severity: 'info',
  title: 'Test',
  message: 'Test message',
  isRead: false,
  createdAt: new Date(),
  ...overrides,
})

describe('notificationHelpers', () => {
  describe('formatNotification', () => {
    it('should format notification with severity prefix', () => {
      const n = mockNotification({ severity: 'error', title: 'Error occurred' })
      expect(formatNotification(n)).toBe('[ERROR] Error occurred: Test message')
    })
  })

  describe('filterNotifications', () => {
    it('should filter by severity', () => {
      const notifications = [
        mockNotification({ id: '1', severity: 'info' }),
        mockNotification({ id: '2', severity: 'error' }),
      ]
      expect(filterNotifications(notifications, { severity: 'error' })).toHaveLength(1)
      expect(filterNotifications(notifications, { severity: 'error' })[0].id).toBe('2')
    })

    it('should filter by isRead status', () => {
      const notifications = [
        mockNotification({ id: '1', isRead: true }),
        mockNotification({ id: '2', isRead: false }),
      ]
      expect(filterNotifications(notifications, { isRead: false })).toHaveLength(1)
    })
  })

  describe('getUnreadCount', () => {
    it('should count unread notifications', () => {
      const notifications = [
        mockNotification({ id: '1', isRead: false }),
        mockNotification({ id: '2', isRead: true }),
        mockNotification({ id: '3', isRead: false }),
      ]
      expect(getUnreadCount(notifications)).toBe(2)
    })
  })

  describe('sortBySeverity', () => {
    it('should sort error > warning > info', () => {
      const notifications = [
        mockNotification({ id: '1', severity: 'info' }),
        mockNotification({ id: '2', severity: 'error' }),
        mockNotification({ id: '3', severity: 'warning' }),
      ]
      const sorted = sortBySeverity(notifications)
      expect(sorted[0].severity).toBe('error')
      expect(sorted[1].severity).toBe('warning')
      expect(sorted[2].severity).toBe('info')
    })
  })
})
```

**Verify:** `pnpm vitest run src/utils/notificationHelpers.test.ts`

---

## Step 4: Create consolidated notifications route

**File:** `src/routes/notifications.ts`
**Change:** Create consolidated route with GET /notifications, POST /notifications, PATCH /notifications/:id/read

```typescript
import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'
import { NotificationService } from '@/services/notifications'

export const GET = withAuth(async (_request: NextRequest, { user }) => {
  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const payload = await getPayloadInstance()
  const service = new NotificationService(payload)
  const notifications = await service.getUnread(String(user.id))

  return new Response(JSON.stringify({ notifications }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})

export const POST = withAuth(async (_request: NextRequest, { user }) => {
  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const payload = await getPayloadInstance()
  const service = new NotificationService(payload)
  await service.markAllRead(String(user.id))

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
```

**Verify:** `pnpm tsc --noEmit` passes

---

## Step 5: Run full test suite

**Verify:** `pnpm test:int` passes all tests

---

## Questions

- The task specifies notification types (info, warning, error) but the existing `Notifications` collection uses (enrollment, grade, deadline, discussion, announcement). Should `severity` be a new field added to the collection, or is this a separate concern?
- The task specifies `src/services/notificationService.ts` but the existing service is at `src/services/notifications.ts`. Should the new file be a separate module that wraps the existing one, or should we rename?
