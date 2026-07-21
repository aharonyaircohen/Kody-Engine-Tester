'use client'

import { useState, useEffect } from 'react'
import styles from './HealthBadge.module.css'

type HealthStatus = 'ok' | 'down' | 'loading'

export function HealthBadge() {
  const [status, setStatus] = useState<HealthStatus>('loading')

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health')
        if (res.ok && res.status === 200) {
          setStatus('ok')
        } else {
          setStatus('down')
        }
      } catch {
        setStatus('down')
      }
    }

    checkHealth()
  }, [])

  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {status === 'loading' ? '...' : status.toUpperCase()}
    </span>
  )
}