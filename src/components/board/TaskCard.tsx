'use client'

import type { Task } from '@/collections/tasks'
import { PriorityBadge } from './PriorityBadge'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  task: Task
  onDragStart: (id: string) => void
}

export function TaskCard({ task, onDragStart }: TaskCardProps) {
  const initials = task.assignee
    ? task.assignee
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : null

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer?.setData('taskId', task.id)
    onDragStart(task.id)
  }

  return (
    <div
      className={styles.card}
      draggable
      onDragStart={handleDragStart}
      role="listitem"
    >
      <h4 className={styles.title}>{task.title}</h4>
      <div className={styles.footer}>
        <PriorityBadge priority={task.priority} />
        {initials && (
          <div className={styles.avatar} title={task.assignee ?? undefined}>
            {initials}
          </div>
        )}
      </div>
    </div>
  )
}
