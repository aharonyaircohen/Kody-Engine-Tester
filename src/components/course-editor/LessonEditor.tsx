'use client'

import { useState } from 'react'
import type { Lesson, LessonType, UpdateLessonInput } from '@/collections/Lessons'
import styles from './LessonEditor.module.css'

interface LessonEditorProps {
  lesson: Lesson
  onUpdate: (data: UpdateLessonInput) => void
  onDelete: () => void
}

export function LessonEditor({ lesson, onUpdate, onDelete }: LessonEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [preview, setPreview] = useState<boolean>(false)

  function handleTypeChange(type: LessonType) {
    onUpdate({ type })
  }

  function handleTitleChange(title: string) {
    onUpdate({ title })
  }

  function handleContentChange(content: string) {
    onUpdate({ content })
  }

  function handleVideoUrlChange(videoUrl: string) {
    onUpdate({ videoUrl })
  }

  function handleEstimatedMinutesChange(value: string) {
    const parsed = parseInt(value, 10)
    onUpdate({ estimatedMinutes: isNaN(parsed) ? null : parsed })
  }

  return (
    <div className={styles.lesson} data-testid="lesson-editor">
      <div className={styles.lessonHeader}>
        <button
          className={styles.expandButton}
          onClick={() => setIsExpanded((v) => !v)}
          aria-label={isExpanded ? 'collapse lesson' : 'expand lesson'}
          aria-expanded={isExpanded}
        >
          {isExpanded ? '▾' : '▸'}
        </button>

        <span className={`${styles.typeTag} ${styles[`type_${lesson.type}`]}`}>
          {lesson.type}
        </span>

        <span
          className={styles.lessonTitle}
          data-testid="lesson-title"
        >
          {lesson.title}
        </span>

        <button
          className={styles.deleteButton}
          onClick={onDelete}
          aria-label={`delete lesson ${lesson.title}`}
          data-testid="delete-lesson"
        >
          ✕
        </button>
      </div>

      {isExpanded && (
        <div className={styles.lessonBody} data-testid="lesson-body">
          <button
            type="button"
            className={styles.previewToggle}
            onClick={() => setPreview((v) => !v)}
            aria-pressed={preview}
            data-testid="preview-toggle"
          >
            Preview / Edit
          </button>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`title-${lesson.id}`}>
              Title
            </label>
            <input
              id={`title-${lesson.id}`}
              className={styles.input}
              value={lesson.title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Type</label>
            <div className={styles.typeSelector} role="group" aria-label="lesson type">
              {(['text', 'video', 'interactive'] as LessonType[]).map((t) => (
                <button
                  key={t}
                  className={`${styles.typeButton} ${lesson.type === t ? styles.typeButtonActive : ''}`}
                  onClick={() => handleTypeChange(t)}
                  data-testid={`type-${t}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {lesson.type === 'video' && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor={`video-${lesson.id}`}>
                Video URL
              </label>
              <input
                id={`video-${lesson.id}`}
                className={styles.input}
                type="url"
                placeholder="https://..."
                value={lesson.videoUrl ?? ''}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                readOnly={preview}
                data-testid="video-url-input"
              />
            </div>
          )}

          {lesson.type !== 'video' && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor={`content-${lesson.id}`}>
                Content
              </label>
              <textarea
                id={`content-${lesson.id}`}
                className={styles.textarea}
                rows={6}
                value={lesson.content}
                onChange={(e) => handleContentChange(e.target.value)}
                readOnly={preview}
                data-testid="content-textarea"
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor={`minutes-${lesson.id}`}>
              Estimated minutes
            </label>
            <input
              id={`minutes-${lesson.id}`}
              className={styles.input}
              type="number"
              min={1}
              value={lesson.estimatedMinutes ?? ''}
              onChange={(e) => handleEstimatedMinutesChange(e.target.value)}
              data-testid="estimated-minutes-input"
            />
          </div>
        </div>
      )}
    </div>
  )
}
