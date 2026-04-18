'use client'

import { useState } from 'react'
import type { Task, TaskPriority } from '@/collections/tasks'
import styles from './modal.module.css'

interface TaskModalProps {
  initialValues?: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'assignee'>>
  onSubmit: (data: { title: string; description: string; priority: TaskPriority; assignee: string | null }) => void
  onClose: () => void
}

export function TaskModal({ initialValues, onSubmit, onClose }: TaskModalProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [priority, setPriority] = useState<TaskPriority>(initialValues?.priority ?? 'medium')
  const [assignee, setAssignee] = useState(initialValues?.assignee ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      title,
      description,
      priority,
      assignee: assignee.trim() || null,
    })
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{initialValues ? 'Edit Task' : 'New Task'}</h2>
          <button className={styles.closeButton} onClick={onClose} type="button" aria-label="Close">
            ×
          </button>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Title
            <input
              className={styles.input}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label className={styles.label}>
            Description
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Optional description..."
            />
          </label>
          <label className={styles.label}>
            Priority
            <select
              className={styles.select}
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className={styles.label}>
            Assignee
            <input
              className={styles.input}
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Name (optional)"
            />
          </label>
          <div className={styles.actions}>
            <button className={styles.cancelButton} type="button" onClick={onClose}>
              Cancel
            </button>
            <button className={styles.submitButton} type="submit">
              {initialValues ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskModal
