'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { NotificationsStore } from '@/collections/notifications'
import type { Notification } from '@/collections/notifications'
import styles from './bell.module.css'

const MAX_PREVIEW = 5

interface NotificationBellProps {
  store: NotificationsStore
}

export function NotificationBell({ store }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    setNotifications(store.getAll())
  }, [store])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const preview = notifications.slice(0, MAX_PREVIEW)

  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount)

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        className={styles.button}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        type="button"
      >
        🔔
        {unreadCount > 0 && <span className={styles.badge}>{badgeLabel}</span>}
      </button>

      {open && (
        <div className={styles.dropdown} role="menu">
          <div className={styles.dropdownHeader}>Notifications</div>
          {preview.length === 0 ? (
            <div className={styles.empty}>No notifications</div>
          ) : (
            <ul className={styles.list}>
              {preview.map((n) => (
                <li
                  key={n.id}
                  className={`${styles.item} ${!n.read ? styles.itemUnread : ''}`}
                  onClick={() => {
                    if (!n.read) store.markAsRead(n.id)
                    setNotifications(store.getAll())
                  }}
                  role="menuitem"
                >
                  <p className={styles.itemTitle}>{n.title}</p>
                  <p className={styles.itemMessage}>{n.message}</p>
                </li>
              ))}
            </ul>
          )}
          <div className={styles.footer}>
            <Link href="/notifications" className={styles.viewAll} onClick={() => setOpen(false)}>
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
