import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { NotificationBell } from './bell'
import { NotificationsStore } from '@/collections/notifications'

describe('NotificationBell', () => {
  let store: NotificationsStore

  beforeEach(() => {
    store = new NotificationsStore()
  })

  describe('badge count', () => {
    it('should not show badge when no unread notifications', () => {
      render(<NotificationBell store={store} />)
      const badge = screen.queryByText('0')
      expect(badge).toBeNull()
    })

    it('should show badge with unread count', () => {
      store.create({ type: 'info', title: 'A', message: '', category: 'system' })
      store.create({ type: 'warning', title: 'B', message: '', category: 'task' })
      render(<NotificationBell store={store} />)
      expect(screen.getByText('2')).toBeDefined()
    })

    it('should cap badge display at 9+ for many notifications', () => {
      for (let i = 0; i < 12; i++) {
        store.create({ type: 'info', title: `N${i}`, message: '', category: 'system' })
      }
      render(<NotificationBell store={store} />)
      expect(screen.getByText('9+')).toBeDefined()
    })
  })

  describe('dropdown', () => {
    it('should open dropdown on click', () => {
      render(<NotificationBell store={store} />)
      fireEvent.click(screen.getByRole('button'))
      expect(screen.getByText('Notifications')).toBeDefined()
    })

    it('should show last 5 notifications in dropdown', async () => {
      for (let i = 0; i < 7; i++) {
        store.create({ type: 'info', title: `N${i}`, message: `msg${i}`, category: 'system' })
      }
      render(<NotificationBell store={store} />)
      fireEvent.click(screen.getByRole('button'))
      const items = screen.getAllByRole('menuitem')
      expect(items).toHaveLength(5)
    })

    it('should show "No notifications" when empty', () => {
      render(<NotificationBell store={store} />)
      fireEvent.click(screen.getByRole('button'))
      expect(screen.getByText('No notifications')).toBeDefined()
    })

    it('should show "View all" link', () => {
      render(<NotificationBell store={store} />)
      fireEvent.click(screen.getByRole('button'))
      const link = screen.getByRole('link', { name: 'View all' })
      expect(link).toBeDefined()
      expect(link.getAttribute('href')).toBe('/notifications')
    })

    it('should close dropdown on second click', () => {
      render(<NotificationBell store={store} />)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(screen.getByText('Notifications')).toBeDefined()
      fireEvent.click(button)
      expect(screen.queryByText('Notifications')).toBeNull()
    })
  })
})
