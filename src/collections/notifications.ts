export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export type NotificationCategory = 'system' | 'task' | 'social'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: Date
  expiresAt?: Date
  actionUrl?: string
  category: NotificationCategory
}

export interface CreateNotificationInput {
  type: NotificationType
  title: string
  message: string
  category: NotificationCategory
  expiresAt?: Date
  actionUrl?: string
}

export interface UpdateNotificationInput {
  type?: NotificationType
  title?: string
  message?: string
  read?: boolean
  expiresAt?: Date
  actionUrl?: string
  category?: NotificationCategory
}

export interface QuietHours {
  enabled: boolean
  start: string // HH:MM format
  end: string // HH:MM format
}

export interface NotificationPreferences {
  categories: Record<NotificationCategory, boolean>
  quietHours: QuietHours
}

export class NotificationsStore {
  private notifications: Map<string, Notification> = new Map()
  private preferences: NotificationPreferences = {
    categories: {
      system: true,
      task: true,
      social: true,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  }

  getAll(): Notification[] {
    return Array.from(this.notifications.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )
  }

  getById(id: string): Notification | null {
    return this.notifications.get(id) ?? null
  }

  create(input: CreateNotificationInput): Notification {
    const now = new Date()
    const notification: Notification = {
      id: crypto.randomUUID(),
      type: input.type,
      title: input.title,
      message: input.message,
      read: false,
      createdAt: now,
      expiresAt: input.expiresAt,
      actionUrl: input.actionUrl,
      category: input.category,
    }
    this.notifications.set(notification.id, notification)
    return notification
  }

  update(id: string, input: UpdateNotificationInput): Notification {
    const notification = this.notifications.get(id)
    if (!notification) {
      throw new Error(`Notification with id "${id}" not found`)
    }
    const updated: Notification = {
      ...notification,
      ...input,
    }
    this.notifications.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.notifications.delete(id)
  }

  markAsRead(id: string): Notification {
    return this.update(id, { read: true })
  }

  markAllRead(): Notification[] {
    const all = this.getAll()
    all.forEach((n) => {
      if (!n.read) {
        this.update(n.id, { read: true })
      }
    })
    return this.getAll()
  }

  getUnread(): Notification[] {
    return this.getAll().filter((n) => !n.read)
  }

  filterByCategory(category?: NotificationCategory): Notification[] {
    if (!category) return this.getAll()
    return this.getAll().filter((n) => n.category === category)
  }

  clearExpired(): Notification[] {
    const now = new Date()
    const expired: Notification[] = []
    this.notifications.forEach((n) => {
      if (n.expiresAt && n.expiresAt <= now) {
        expired.push(n)
        this.notifications.delete(n.id)
      }
    })
    return expired
  }

  getPreferences(): NotificationPreferences {
    return { ...this.preferences }
  }

  setCategoryEnabled(category: NotificationCategory, enabled: boolean): void {
    this.preferences.categories[category] = enabled
  }

  setQuietHours(quietHours: QuietHours): void {
    this.preferences.quietHours = { ...quietHours }
  }

  isCategoryEnabled(category: NotificationCategory): boolean {
    return this.preferences.categories[category] ?? true
  }

  isOutsideQuietHours(now: Date): boolean {
    if (!this.preferences.quietHours.enabled) return true

    const current = now.getHours() * 60 + now.getMinutes()
    const [startH, startM] = this.preferences.quietHours.start.split(':').map(Number)
    const [endH, endM] = this.preferences.quietHours.end.split(':').map(Number)
    const start = startH * 60 + startM
    const end = endH * 60 + endM

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      // Outside quiet hours if current time is NOT in the overnight window
      return current < start && current >= end
    }
    // Normal range: outside if not in [start, end]
    return current < start || current >= end
  }
}

export const notificationsStore = new NotificationsStore()
