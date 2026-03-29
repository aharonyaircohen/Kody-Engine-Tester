'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { notificationsStore } from '@/collections/notifications'
import type { Notification, NotificationCategory } from '@/collections/notifications'
import styles from './index.module.css'

type FilterCategory = NotificationCategory | 'all'

const CATEGORIES: { value: FilterCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'system', label: 'System' },
  { value: 'task', label: 'Task' },
  { value: 'social', label: 'Social' },
]

const TYPE_ICONS: Record<string, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
}

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all')
  const [refreshKey, setRefreshKey] = useState(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const notifications = useMemo(() => notificationsStore.getAll(), [refreshKey])

  const filtered = activeFilter === 'all'
    ? notifications
    : notifications.filter((n) => n.category === activeFilter)

  const unreadCount = notifications.filter((n) => !n.read).length

  function handleMarkAllRead() {
    notificationsStore.markAllRead()
    setRefreshKey((k) => k + 1)
  }

  function handleMarkRead(id: string) {
    notificationsStore.markAsRead(id)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ margin: 0, color: '#e0e0e0' }}>Notifications</h1>
          {unreadCount > 0 && (
            <span style={{
              backgroundColor: '#f44336',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '12px',
            }}>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#6c63ff',
              border: '1px solid #6c63ff',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Category filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveFilter(cat.value)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: activeFilter === cat.value ? 600 : 400,
              backgroundColor: activeFilter === cat.value ? '#6c63ff' : '#2a2a4a',
              color: activeFilter === cat.value ? 'white' : '#999',
              transition: 'all 0.15s',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#666', fontSize: '0.9rem' }}>
          No notifications
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`${styles.item} ${!n.read ? styles.unread : ''}`}
              onClick={() => !n.read && handleMarkRead(n.id)}
              style={{ cursor: n.read ? 'default' : 'pointer' }}
              role={n.actionUrl ? 'link' : undefined}
              tabIndex={n.actionUrl ? 0 : undefined}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && n.actionUrl) {
                  window.location.href = n.actionUrl
                }
              }}
            >
              <span className={styles.icon} aria-hidden="true">
                {TYPE_ICONS[n.type] ?? 'ℹ️'}
              </span>
              <div className={styles.body}>
                <div className={styles.header}>
                  <span className={styles.title}>{n.title}</span>
                  {!n.read && <span className={styles.unreadDot} aria-label="Unread" />}
                </div>
                <p className={styles.message}>{n.message}</p>
                <div className={styles.meta}>
                  <span className={styles.category}>{n.category}</span>
                  <time className={styles.date}>
                    {n.createdAt.toLocaleDateString()} {n.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>
              </div>
              {n.actionUrl && (
                <Link
                  href={n.actionUrl}
                  className={styles.actionLink}
                  onClick={(e) => e.stopPropagation()}
                >
                  View →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {unreadCount === 0 && notifications.length > 0 && (
        <div style={{ marginTop: '16px', textAlign: 'center', color: '#666', fontSize: '0.8rem' }}>
          All caught up! ✓
        </div>
      )}
    </div>
  )
}
