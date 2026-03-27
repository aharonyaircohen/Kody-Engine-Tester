'use client'

import { useState } from 'react'
import { useFormValidation, required } from '../../validation'
import styles from './NoteForm.module.css'

interface NoteFormProps {
  initialValues?: { title: string; content: string; tags: string[] }
  onSubmit: (data: { title: string; content: string; tags: string[] }) => void
  submitLabel: string
}

const noteSchema = {
  title: required(),
  content: required(),
}

export function NoteForm({ initialValues, onSubmit, submitLabel }: NoteFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [content, setContent] = useState(initialValues?.content ?? '')
  const [tagsInput, setTagsInput] = useState(initialValues?.tags.join(', ') ?? '')
  const { errors, validate, clearErrors } = useFormValidation(noteSchema)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = validate({ title, content })
    if (!result.valid) return
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onSubmit({ title, content, tags })
  }

  function handleTitleBlur() {
    clearErrors()
    validate({ title, content })
  }

  function handleContentBlur() {
    clearErrors()
    validate({ title, content })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label}>
        Title
        <input
          className={`${styles.input}${errors.title ? ` ${styles.inputError}` : ''}`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
        />
        {errors.title && <span className={styles.error}>{errors.title}</span>}
      </label>
      <label className={styles.label}>
        Content
        <textarea
          className={`${styles.textarea}${errors.content ? ` ${styles.textareaError}` : ''}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleContentBlur}
          rows={8}
        />
        {errors.content && <span className={styles.error}>{errors.content}</span>}
      </label>
      <label className={styles.label}>
        Tags (comma-separated)
        <input
          className={styles.input}
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </label>
      <button className={styles.button} type="submit">
        {submitLabel}
      </button>
    </form>
  )
}
