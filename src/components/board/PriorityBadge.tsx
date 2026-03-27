'use client'

import type { TaskPriority } from '@/collections/tasks'
import styles from './PriorityBadge.module.css'

interface PriorityBadgeProps {
  priority: TaskPriority
}

const labels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[priority]}`}>
      {labels[priority]}
    </span>
  )
}
