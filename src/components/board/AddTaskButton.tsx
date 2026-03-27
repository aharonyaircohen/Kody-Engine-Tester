'use client'

import styles from './AddTaskButton.module.css'

interface AddTaskButtonProps {
  onClick: () => void
}

export function AddTaskButton({ onClick }: AddTaskButtonProps) {
  return (
    <button className={styles.button} onClick={onClick} type="button">
      + Add Task
    </button>
  )
}
