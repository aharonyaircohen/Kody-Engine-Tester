

This is a Kody Engine pipeline task at the **plan stage**. The `decompose` stage (run by taskify) already split the 8-scope task into 4 parallel work areas. I need to produce an implementation plan that maps each sub-task to its deliverable with TDD ordering.

The allowed working directory is the task subdirectory only — no access to the main repo. I'll write the plan based on the established patterns described in the project memory.

---

## Plan

The task has 8 scope items across 4 parallel areas. Each area follows: **test first → implementation**.

---

### Step 1: Notification data model + tests

**File:** `src/models/notification.ts`
**Change:** Create TypeScript type definitions and in-memory store for the `Notification` entity following the existing store pattern (singleton `notifications` array, CRUD operations).
```typescript
export type NotificationType = 'info' | 'warning' | 'error' | 'success'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: Date
}

export interface NotificationServiceDeps {
  // placeholder for future injected dependencies
}

class NotificationStore {
  private notifications: Notification[] = []

  create(data: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
    const notification: Notification = {
      ...data,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date(),
    }
    this.notifications.push(notification)
    return notification
  }

  getByUserId(userId: string): Notification[] {
    return this.notifications.filter(n => n.userId === userId)
  }

  markRead(id: string): boolean {
    const n = this.notifications.find(n => n.id === id)
    if (!n) return false
    n.read = true
    return true
  }

  delete(id: string): boolean {
    const idx = this.notifications.findIndex(n => n.id === id)
    if (idx === -1) return false
    this.notifications.splice(idx, 1)
    return true
  }
}

export const notificationsStore = new NotificationStore()
```

**File:** `src/models/notification.test.ts`
**Change:** Create test file co-located with model:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { notificationsStore } from './notification'

describe('notificationsStore', () => {
  beforeEach(() => {
    // reset store between tests
    notificationsStore.notifications.length = 0
  })

  it('creates a notification with generated id and defaults', () => {
    const n = notificationsStore.create({
      userId: 'user-1',
      type: 'info',
      title: 'Test',
      message: 'Hello',
    })
    expect(n.id).toBeTruthy()
    expect(n.read).toBe(false)
    expect(n.createdAt).toBeInstanceOf(Date)
  })

  it('getByUserId returns only matching notifications', () => {
    notificationsStore.create({ userId: 'user-1', type: 'info', title: 'T1', message: 'M1' })
    notificationsStore.create({ userId: 'user-2', type: 'warning', title: 'T2', message: 'M2' })
    const results = notificationsStore.getByUserId('user-1')
    expect(results).toHaveLength(1)
    expect(results[0].userId).toBe('user-1')
  })

  it('markRead returns false for unknown id', () => {
    expect(notificationsStore.markRead('nonexistent')).toBe(false)
  })

  it('delete removes notification', () => {
    const n = notificationsStore.create({ userId: 'user-1', type: 'info', title: 'T', message: 'M' })
    expect(notificationsStore.delete(n.id)).toBe(true)
    expect(notificationsStore.getByUserId('user-1')).toHaveLength(0)
  })
})
```

**Why:** Establishes the data model and in-memory store before the service layer depends on it. Follows co-located test pattern.

**Verify:** `pnpm test:int -- --run src/models/notification.test.ts`

---

### Step 2: NotificationService + tests

**File:** `src/services/notificationService.test.ts`
**Change:** Create test file first (TDD):
```typescript
import { describe, it, expect, vi } from 'vitest'
import { NotificationService, createNotificationService } from './notificationService'

describe('NotificationService', () => {
  it('send returns ok result with notification', () => {
    const service = createNotificationService()
    const result = service.send({ userId: 'u1', type: 'info', title: 'Hi', message: 'There' })
    expect(result.ok).toBe(true)
    expect(result.val).toBeDefined()
    expect(result.val?.userId).toBe('u1')
  })

  it('getUserNotifications returns all for a user', () => {
    const service = createNotificationService()
    service.send({ userId: 'u1', type: 'info', title: 'A', message: 'B' })
    service.send({ userId: 'u1', type: 'warning', title: 'C', message: 'D' })
    const result = service.getUserNotifications('u1')
    expect(result.ok).toBe(true)
    expect(result.val).toHaveLength(2)
  })

  it('getUserNotifications returns empty ok for unknown user', () => {
    const service = createNotificationService()
    const result = service.getUserNotifications('nobody')
    expect(result.ok).toBe(true)
    expect(result.val).toHaveLength(0)
  })

  it('markRead returns err for unknown id', () => {
    const service = createNotificationService()
    const result = service.markRead('fake-id')
    expect(result.ok).toBe(false)
  })

  it('markRead returns ok for existing id', () => {
    const service = createNotificationService()
    const sendResult = service.send({ userId: 'u1', type: 'info', title: 'T', message: 'M' })
    const markResult = service.markRead(sendResult.val!.id)
    expect(markResult.ok).toBe(true)
  })
})
```

**File:** `src/services/notificationService.ts`
**Change:** Create service with typed deps interface and `Result` returns:
```typescript
import type { Notification, NotificationType } from '@/models/notification'
import { notificationsStore } from '@/models/notification'
import type { Result } from '@/utils/result'
import { ok, err } from '@/utils/result'

export interface NotificationServiceDeps {
  store?: typeof notificationsStore
}

export interface INotificationService {
  send(data: { userId: string; type: NotificationType; title: string; message: string }): Result<Notification, string>
  getUserNotifications(userId: string): Result<Notification[], string>
  markRead(id: string): Result<void, string>
  delete(id: string): Result<void, string>
}

export function createNotificationService(deps?: NotificationServiceDeps): INotificationService {
  const store = deps?.store ?? notificationsStore

  return {
    send(data) {
      try {
        const notification = store.create(data)
        return ok(notification)
      } catch (e) {
        return err(String(e))
      }
    },

    getUserNotifications(userId) {
      try {
        return ok(store.getByUserId(userId))
      } catch (e) {
        return err(String(e))
      }
    },

    markRead(id) {
      const success = store.markRead(id)
      return success ? ok() : err('Notification not found')
    },

    delete(id) {
      const success = store.delete(id)
      return success ? ok() : err('Notification not found')
    },
  }
}

export const notificationService = createNotificationService()
```

**Why:** Service layer wraps the store with `Result<T, E>` returns. Typed deps interface follows `GradebookServiceDeps` pattern from existing codebase.

**Verify:** `pnpm test:int -- --run src/services/notificationService.test.ts`

---

### Step 3: REST API route + tests

**File:** `src/routes/notifications.test.ts`
**Change:** Create test file first (TDD):
```typescript
import { describe, it, expect, vi } from 'vitest'
import type { Request, Response } from 'express'
import { notificationsRouter } from './notifications'

// Mock withAuth
vi.mock('@/auth/withAuth', () => ({
  withAuth: vi.fn((handler) => handler),
}))

function makeMockReq(method: string, path: string, body?: unknown): Request {
  return { method, path, body } as unknown as Request
}
function makeMockRes(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
}

describe('notificationsRouter', () => {
  it('POST / — returns 201 with notification on valid input', async () => {
    const handler = notificationsRouter['handlers'].post
    const req = makeMockReq('POST', '/notifications', {
      userId: 'u1',
      type: 'info',
      title: 'Hello',
      message: 'World',
    })
    const res = makeMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalled()
  })

  it('POST / — returns 400 on missing required fields', async () => {
    const handler = notificationsRouter['handlers'].post
    const req = makeMockReq('POST', '/notifications', { userId: 'u1' })
    const res = makeMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('GET /user/:userId — returns 200 with notifications', async () => {
    const handler = notificationsRouter['handlers'].getUser
    const req = { params: { userId: 'u1' } } as unknown as Request
    const res = makeMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('PATCH /:id/read — returns 200 on mark read', async () => {
    const handler = notificationsRouter['handlers'].markRead
    const req = { params: { id: 'test-id' } } as unknown as Request
    const res = makeMockRes()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
```

**File:** `src/routes/notifications.ts`
**Change:** Create Express-style router with withAuth middleware chain and Zod validation:
```typescript
import type { Request, Response, NextFunction } from 'express'
import { withAuth } from '@/auth/withAuth'
import { createNotificationService } from '@/services/notificationService'
import { z } from 'zod'
import { ok, err } from '@/utils/result'

const CreateNotificationSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(['info', 'warning', 'error', 'success']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
})

const service = createNotificationService()

async function postNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  const parsed = CreateNotificationSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const result = service.send(parsed.data)
  if (!result.ok) {
    res.status(400).json({ error: result.err })
    return
  }

  res.status(201).json(result.val)
}

async function getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { userId } = req.params
  const result = service.getUserNotifications(userId)
  if (!result.ok) {
    res.status(400).json({ error: result.err })
    return
  }
  res.status(200).json(result.val)
}

async function markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  const result = service.markRead(req.params.id)
  if (!result.ok) {
    res.status(404).json({ error: result.err })
    return
  }
  res.status(200).json({ ok: true })
}

async function deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  const result = service.delete(req.params.id)
  if (!result.ok) {
    res.status(404).json({ error: result.err })
    return
  }
  res.status(204).send()
}

export const notificationsRouter = {
  path: '/notifications',
  middleware: [withAuth],
  handlers: {
    post: postNotification,
    getUser: getUserNotifications,
    markRead,
    delete: deleteNotification,
  },
}
```

**Why:** REST route using withAuth HOC, Zod input validation, and Result responses — follows existing API patterns in the project.

**Verify:** `pnpm test:int -- --run src/routes/notifications.test.ts`

---

### Step 4: Notification helpers + tests

**File:** `src/utils/notificationHelpers.test.ts`
**Change:** Create test file first (TDD):
```typescript
import { describe, it, expect } from 'vitest'
import {
  formatNotificationMessage,
  groupNotificationsByType,
  isUnread,
  buildNotificationPayload,
} from './notificationHelpers'
import type { Notification } from '@/models/notification'

const makeNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: 'n1',
  userId: 'u1',
  type: 'info',
  title: 'Test',
  message: 'Test message',
  read: false,
  createdAt: new Date(),
  ...overrides,
})

describe('formatNotificationMessage', () => {
  it('returns title by default', () => {
    expect(formatNotificationMessage(makeNotification())).toBe('Test')
  })

  it('includes userId prefix for mentions', () => {
    const n = makeNotification({ message: '@u1 please review' })
    expect(formatNotificationMessage(n)).toContain('u1')
  })
})

describe('groupNotificationsByType', () => {
  it('groups by notification type', () => {
    const notifications = [
      makeNotification({ id: '1', type: 'info' }),
      makeNotification({ id: '2', type: 'warning' }),
      makeNotification({ id: '3', type: 'info' }),
      makeNotification({ id: '4', type: 'error' }),
    ]
    const grouped = groupNotificationsByType(notifications)
    expect(grouped.info).toHaveLength(2)
    expect(grouped.warning).toHaveLength(1)
    expect(grouped.error).toHaveLength(1)
  })
})

describe('isUnread', () => {
  it('returns true for unread notifications', () => {
    expect(isUnread(makeNotification({ read: false }))).toBe(true)
  })
  it('returns false for read notifications', () => {
    expect(isUnread(makeNotification({ read: true }))).toBe(false)
  })
})

describe('buildNotificationPayload', () => {
  it('builds payload with defaults', () => {
    const payload = buildNotificationPayload({ userId: 'u1', title: 'T', message: 'M' })
    expect(payload.type).toBe('info')
    expect(payload.read).toBe(false)
  })
  it('allows override of type', () => {
    const payload = buildNotificationPayload({ userId: 'u1', title: 'T', message: 'M', type: 'error' })
    expect(payload.type).toBe('error')
  })
})
```

**File:** `src/utils/notificationHelpers.ts`
**Change:** Create pure helper functions:
```typescript
import type { Notification, NotificationType } from '@/models/notification'

/**
 * Format a notification for display, resolving mentions.
 */
export function formatNotificationMessage(notification: Notification): string {
  if (notification.message.includes(`@${notification.userId}`)) {
    return `[${notification.userId}] ${notification.title}`
  }
  return notification.title
}

/**
 * Group notifications by type for dashboard display.
 */
export function groupNotificationsByType(notifications: Notification[]): Record<NotificationType, Notification[]> {
  const grouped: Record<NotificationType, Notification[]> = {
    info: [],
    warning: [],
    error: [],
    success: [],
  }
  for (const n of notifications) {
    grouped[n.type].push(n)
  }
  return grouped
}

/**
 * Returns true if the notification is unread.
 */
export function isUnread(notification: Notification): boolean {
  return notification.read === false
}

/**
 * Build a notification payload object with defaults applied.
 */
export function buildNotificationPayload(
  data: { userId: string; title: string; message: string; type?: NotificationType }
): Omit<Notification, 'id' | 'createdAt'> {
  return {
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type ?? 'info',
    read: false,
  }
}
```

**Why:** Pure utility functions that support the notification service. Tests verify grouping, filtering, and formatting — reusable across routes and UI components.

**Verify:** `pnpm test:int -- --run src/utils/notificationHelpers.test.ts`

---

## Implementation Order (Parallel Groups)

The 8 scope items form 4 independent pairs. These can be implemented concurrently:

| Group | Implementation | Test |
|-------|---------------|------|
| A | `src/models/notification.ts` | `src/models/notification.test.ts` |
| B | `src/services/notificationService.ts` | `src/services/notificationService.test.ts` |
| C | `src/routes/notifications.ts` | `src/routes/notifications.test.ts` |
| D | `src/utils/notificationHelpers.ts` | `src/utils/notificationHelpers.test.ts` |

Each pair must pass its test before the next group starts.

---

## Pattern Discovery Report

- **`Result<T, E>` discriminated union** (`src/utils/result.ts`): Reused in `NotificationService` for all return values — no thrown exceptions from the service layer.
- **Typed dependency interface** (`GradebookServiceDeps`): Reused as `NotificationServiceDeps` to allow test injection of the store.
- **`withAuth` HOC** (`src/auth/withAuth.ts`): Applied to all route handlers — no direct JWT handling in routes.
- **In-memory store pattern** (`contactsStore`): Reused as `notificationsStore` with `create|getByUserId|markRead|delete` interface.
- **Co-located tests** (`*.test.ts` next to `*.ts`): TDD approach — test file written before implementation for every module.
- **Zod validation** at API boundaries: Applied in `notifications.ts` for `CreateNotificationSchema`.

No existing patterns for `src/models/`, `src/routes/`, or `src/utils/notificationHelpers.ts` — these are new directories. Implementation follows the closest analogies from the patterns listed above.

---

## Questions

None — the task.json provided all required patterns and the implementation follows established conventions from the project memory. All 4 areas are independent and can proceed in parallel once the plan is approved.