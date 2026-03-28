import type { Payload } from 'payload'
import type { NotificationType } from '@/collections/Notifications'

export class NotificationService {
  constructor(private payload: Payload) {}

  async notify(userId: string, type: NotificationType, title: string, message: string, link?: string) {
    return this.payload.create({
      collection: 'notifications' as any,
      data: {
        recipient: userId,
        type,
        title,
        message,
        link,
        isRead: false,
      } as any,
    })
  }

  async getUnread(userId: string) {
    const result = await this.payload.find({
      collection: 'notifications' as any,
      where: {
        recipient: { equals: userId },
        isRead: { equals: false },
      },
      sort: '-createdAt',
      limit: 50,
    })
    return result.docs
  }

  async markRead(notificationId: string) {
    return this.payload.update({
      collection: 'notifications' as any,
      id: notificationId,
      data: { isRead: true } as any,
    })
  }

  async markAllRead(userId: string) {
    await this.payload.find({
      collection: 'notifications' as any,
      where: {
        recipient: { equals: userId },
        isRead: { equals: false },
      },
      limit: 0,
    })

    return this.payload.update({
      collection: 'notifications' as any,
      where: {
        recipient: { equals: userId },
        isRead: { equals: false },
      },
      data: { isRead: true } as any,
    })
  }
}
