'use client'

import { useState, useCallback } from 'react'
import { taskStore } from '@/collections/tasks'
import type { Task, TaskStatus, TaskPriority } from '@/collections/tasks'
import { Column } from '@/components/board/Column'
import { AddTaskButton } from '@/components/board/AddTaskButton'
import { TaskModal } from '@/components/board/TaskModal'
import styles from './index.module.css'

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'Todo' },
  { status: 'in-progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
]

export default function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>(taskStore.getAll())
  const [modalOpen, setModalOpen] = useState(false)

  function refresh() {
    setTasks([...taskStore.getAll()])
  }

  const handleDrop = useCallback((taskId: string, newStatus: TaskStatus) => {
    taskStore.moveTask(taskId, newStatus)
    refresh()
  }, [])

  function handleAddTask(data: {
    title: string
    description: string
    priority: TaskPriority
    assignee: string | null
  }) {
    taskStore.create(data)
    refresh()
    setModalOpen(false)
  }

  function handleDragStart() {
    // Could be used for visual feedback
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <h1 className={styles.heading}>Task Board</h1>
        <AddTaskButton onClick={() => setModalOpen(true)} />
      </div>
      <div className={styles.board}>
        {COLUMNS.map(({ status, label }) => (
          <Column
            key={status}
            title={label}
            tasks={tasks.filter((t) => t.status === status)}
            onDrop={(taskId) => handleDrop(taskId, status)}
            onDragStart={handleDragStart}
          />
        ))}
      </div>
      {modalOpen && (
        <TaskModal
          onSubmit={handleAddTask}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
