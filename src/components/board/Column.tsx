'use client'

import { useState } from 'react'
import type { Task } from '@/collections/tasks'
import { TaskCard } from './TaskCard'
import styles from './Column.module.css'

interface ColumnProps {
  title: string
  tasks: Task[]
  onDrop: (taskId: string) => void
  onDragStart: (taskId: string) => void
}

export function Column({ title, tasks, onDrop, onDragStart }: ColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(true)
  }

  function handleDragLeave() {
    setIsDragOver(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      onDrop(taskId)
    }
  }

  return (
    <div
      className={`${styles.column} ${isDragOver ? styles.dragOver : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid="board-column"
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.count}>{tasks.length}</span>
      </div>
      <div className={styles.tasks} role="list" aria-label={`${title} tasks`}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  )
}
