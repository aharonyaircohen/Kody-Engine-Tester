'use client'

import { useState } from 'react'
import styles from './CoursePublishToggle.module.css'

export type PublishStatus = 'draft' | 'published'

interface CoursePublishToggleProps {
  status: PublishStatus
  onToggle: (newStatus: PublishStatus) => void
}

export function CoursePublishToggle({ status, onToggle }: CoursePublishToggleProps) {
  const [showDialog, setShowDialog] = useState(false)

  function handleClick() {
    setShowDialog(true)
  }

  function handleConfirm() {
    setShowDialog(false)
    onToggle(status === 'published' ? 'draft' : 'published')
  }

  function handleCancel() {
    setShowDialog(false)
  }

  const isPublished = status === 'published'

  return (
    <div className={styles.wrapper}>
      <div className={styles.statusRow}>
        <span className={`${styles.badge} ${isPublished ? styles.badgePublished : styles.badgeDraft}`}>
          {isPublished ? 'Published' : 'Draft'}
        </span>
        <button
          className={`${styles.button} ${isPublished ? styles.buttonUnpublish : styles.buttonPublish}`}
          onClick={handleClick}
          data-testid="publish-toggle-button"
        >
          {isPublished ? 'Unpublish' : 'Publish'}
        </button>
      </div>

      {showDialog && (
        <div
          className={styles.overlay}
          onClick={handleCancel}
          data-testid="confirm-dialog"
        >
          <div
            className={styles.dialog}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.dialogTitle}>
              {isPublished ? 'Unpublish course?' : 'Publish course?'}
            </h3>
            <p className={styles.dialogMessage}>
              {isPublished
                ? 'Students will no longer be able to access this course.'
                : 'The course will be visible to enrolled students.'}
            </p>
            <div className={styles.dialogActions}>
              <button
                className={styles.cancelButton}
                onClick={handleCancel}
                data-testid="cancel-button"
              >
                Cancel
              </button>
              <button
                className={styles.confirmButton}
                onClick={handleConfirm}
                data-testid="confirm-button"
              >
                {isPublished ? 'Unpublish' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
