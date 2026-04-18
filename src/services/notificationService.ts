/**
 * Notification service — business logic layer for in-memory notification operations.
 *
 * Follows the service layer pattern (GradebookServiceDeps) with typed dependency injection
 * and Result<T, E> discriminated union for explicit error handling.
 */

import type { NotificationRecord, NotificationType, NotificationStore } from '@/models/notification'
import { notificationsStore } from '@/models/notification'

// Local Result type matching plan API (plain object, not class-based)
type ServiceResult<T, E = string> = { ok: true; val: T } | { ok: false; err: E }

function ok<T>(val: T): ServiceResult<T, never> {
  return { ok: true, val }
}

function err<T, E>(e: E): ServiceResult<T, E> {
  return { ok: false, err: e }
}

export interface NotificationServiceDeps {
  store?: NotificationStore
}

export interface INotificationService {
  send(data: { userId: string; type: NotificationType; title: string; message: string }): ServiceResult<NotificationRecord, string>
  getUserNotifications(userId: string): ServiceResult<NotificationRecord[], string>
  markRead(id: string): ServiceResult<void, string>
  delete(id: string): ServiceResult<void, string>
}

export class NotificationService {
  constructor(private store: NotificationStore) {}

  send(data: { userId: string; type: NotificationType; title: string; message: string }): ServiceResult<NotificationRecord, string> {
    try {
      const record = this.store.create(data)
      return ok(record)
    } catch (e) {
      return err(String(e))
    }
  }

  getUserNotifications(userId: string): ServiceResult<NotificationRecord[], string> {
    try {
      return ok(this.store.getByUserId(userId))
    } catch (e) {
      return err(String(e))
    }
  }

  markRead(id: string): ServiceResult<void, string> {
    const success = this.store.markRead(id)
    return success ? ok(undefined) : err('Notification not found')
  }

  delete(id: string): ServiceResult<void, string> {
    const success = this.store.delete(id)
    return success ? ok(undefined) : err('Notification not found')
  }
}

export function createNotificationService(deps?: NotificationServiceDeps): INotificationService {
  const store = deps?.store ?? notificationsStore
  return new NotificationService(store)
}

export const notificationService = createNotificationService()
