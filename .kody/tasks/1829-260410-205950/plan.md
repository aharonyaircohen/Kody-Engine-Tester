## Existing Patterns Found

- `src/utils/event-emitter.ts` - `EventEmitter` class with `on`/`once`/`off`/`emit` pattern, already has typed event map support — reused for auth events
- `src/auth/auth-service.ts` - existing service with `login`, `refresh`, `verifyAccessToken`, `logout` methods that need to emit events; uses `createError` helper for typed errors
- `src/auth/auth-service.test.ts` - existing test patterns with `vi.fn()` mocks, `mockPayload` SDK stub, real JWT service instantiation

## Plan

### Step 1: Create auth event types

**File:** `src/auth/auth-events.ts`
**Change:** Define typed event map for auth lifecycle events (`login`, `logout`, `tokenRefresh`) with payload shapes
**Why:** Type-safe event emission requires a typed event map; keeps event schema co-located with auth
**Verify:** `pnpm tsc --noEmit` passes

```typescript
import type { EventEmitter } from '@/utils/event-emitter'

export interface LoginEvent {
  userId: string
  email: string
  role: string
  ipAddress: string
  userAgent: string
  timestamp: Date
}

export interface LogoutEvent {
  userId: string
  timestamp: Date
}

export interface TokenRefreshEvent {
  userId: string
  email: string
  role: string
  timestamp: Date
}

export type AuthEvents = {
  login: [LoginEvent]
  logout: [LogoutEvent]
  tokenRefresh: [TokenRefreshEvent]
}

export function createAuthEventEmitter(): EventEmitter<AuthEvents> {
  return new EventEmitter<AuthEvents>()
}
```

---

### Step 2: Add event emitter to AuthService constructor

**File:** `src/auth/auth-service.ts`
**Change:** Add optional `eventEmitter?: EventEmitter<AuthEvents>` parameter to constructor. Emit events in `login`, `refresh`, and `logout` methods.
**Why:** AuthService already handles login/refresh/logout — adding event emission lets external systems subscribe to auth lifecycle
**Verify:** `pnpm test:int src/auth/auth-service.test.ts` passes

In `login()` after line 138 (`await this.payload.update(...)`), add:
```typescript
this.eventEmitter?.emit('login', {
  userId: String(userId),
  email,
  role,
  ipAddress,
  userAgent,
  timestamp: new Date(),
})
```

In `refresh()` after line 207 (`await this.payload.update(...)`), add:
```typescript
this.eventEmitter?.emit('tokenRefresh', {
  userId: payload.userId,
  email: payload.email,
  role: payload.role,
  timestamp: new Date(),
})
```

In `logout()` before line 254, capture userId:
```typescript
this.eventEmitter?.emit('logout', {
  userId: String(userId),
  timestamp: new Date(),
})
```

Constructor change:
```typescript
export class AuthService {
  constructor(
    private payload: Payload,
    private jwtService: JwtService,
    private eventEmitter?: EventEmitter<AuthEvents>,
  ) {}
```

Add import:
```typescript
import type { EventEmitter } from '@/utils/event-emitter'
import type { AuthEvents, LoginEvent, LogoutEvent, TokenRefreshEvent } from './auth-events'
```

---

### Step 3: Add tests for auth event emission

**File:** `src/auth/auth-service.test.ts`
**Change:** Add new `describe('event emission')` blocks in each `login`, `refresh`, and `logout` describe block testing that the event emitter is called with correct payload
**Why:** TDD — verify event emission contract before relying on it
**Verify:** `pnpm test:int src/auth/auth-service.test.ts` passes

Example for login (add after existing login tests):
```typescript
describe('event emission', () => {
  it('should emit login event on successful login', async () => {
    const eventEmitter = { emit: vi.fn() }
    const service = new AuthService(mockPayload as any, jwtService, eventEmitter as any)
    mockPayload.find.mockResolvedValue({ docs: [mockUser] })
    
    await service.login('admin@example.com', 'password123', '192.168.1.1', 'Chrome')
    
    expect(eventEmitter.emit).toHaveBeenCalledWith('login', expect.objectContaining({
      userId: '1',
      email: 'admin@example.com',
      role: 'admin',
      ipAddress: '192.168.1.1',
      userAgent: 'Chrome',
      timestamp: expect.any(Date),
    }))
  })

  it('should not throw when eventEmitter is not provided', async () => {
    const service = new AuthService(mockPayload as any, jwtService)
    mockPayload.find.mockResolvedValue({ docs: [mockUser] })
    
    await expect(service.login('admin@example.com', 'password123', '127.0.0.1', 'TestAgent'))
      .resolves.toHaveProperty('accessToken')
  })
})
```
