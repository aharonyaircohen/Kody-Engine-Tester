/**
 * Notification service — public API surface
 * @module services/notificationService
 *
 * Re-exports the full NotificationService from the services layer so consumers
 * can import from a stable, task-prescribed path:
 *   import { NotificationService } from '@/services/notificationService'
 *
 * The underlying implementation lives in '@/services/notifications'.
 */

export { NotificationService } from './notifications'
