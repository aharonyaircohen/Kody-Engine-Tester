'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { NotificationType } from '@/collections/notifications'
import styles from './toast.module.css'

export interface ToastData {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
}

interface ToastContextValue {
  toasts: ToastData[]
  addToast: (data: Omit<ToastData, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const MAX_VISIBLE = 5

const TYPE_ICONS: Record<NotificationType, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
}

const TYPE_LABELS: Record<NotificationType, string> = {
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
}

export function Toast({ id, type, title, message, duration = 4000, onDismiss }: ToastData & { onDismiss: (id: string) => void }) {
  useEffect(() => {
    if (duration === 0) return
    const timer = setTimeout(() => onDismiss(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onDismiss])

  return (
    <div className={`${styles.toastItem} ${styles[`border${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}>
      <span className={styles.icon} aria-hidden="true">{TYPE_ICONS[type]}</span>
      <div className={styles.body}>
        <p className={styles.title}>{TYPE_LABELS[type]}</p>
        {title && <p className={styles.title}>{title}</p>}
        <p className={styles.message}>{message}</p>
      </div>
      <button
        className={styles.dismiss}
        onClick={() => onDismiss(id)}
        aria-label="Dismiss"
        type="button"
      >
        ×
      </button>
    </div>
  )
}

export function ToastContainer() {
  const ctx = useContext(ToastContext)
  if (!ctx) return null
  const { toasts, removeToast } = ctx

  return (
    <div className={styles.container} role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onDismiss={removeToast} />
      ))}
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Return no-op functions if used outside provider
    return {
      info: (_message: string, _title?: string) => {},
      success: (_message: string, _title?: string) => {},
      warning: (_message: string, _title?: string) => {},
      error: (_message: string, _title?: string) => {},
    }
  }
  const { addToast } = ctx

  const info = useCallback(
    (message: string, title?: string) =>
      addToast({ type: 'info', title: title ?? 'Info', message, duration: 4000 }),
    [addToast],
  )
  const success = useCallback(
    (message: string, title?: string) =>
      addToast({ type: 'success', title: title ?? 'Success', message, duration: 4000 }),
    [addToast],
  )
  const warning = useCallback(
    (message: string, title?: string) =>
      addToast({ type: 'warning', title: title ?? 'Warning', message, duration: 5000 }),
    [addToast],
  )
  const error = useCallback(
    (message: string, title?: string) =>
      addToast({ type: 'error', title: title ?? 'Error', message, duration: 6000 }),
    [addToast],
  )

  return { info, success, warning, error }
}

// Internal provider — wrap your app with this
interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((data: Omit<ToastData, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts((prev) => {
      const next = [...prev, { ...data, id }]
      // Keep max MAX_VISIBLE visible
      return next.slice(-MAX_VISIBLE)
    })
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}
