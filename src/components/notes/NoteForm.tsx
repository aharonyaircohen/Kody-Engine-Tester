'use client'

import { useState } from 'react'
import styles from './NoteForm.module.css'

interface NoteFormProps {
  initialValues?: { title: string; content: string; tags: string[] }
  onSubmit: (data: { title: string; content: string; tags: string[] }) => void
  submitLabel: string
}

export function NoteForm({ initialValues, onSubmit, submitLabel }: NoteFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [content, setContent] = useState(initialValues?.content ?? '')
  const [tagsInput, setTagsInput] = useState(initialValues?.tags.join(', ') ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onSubmit({ title, content, tags })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label}>
        Title
        <input
          className={styles.input}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <label className={styles.label}>
        Content
        <textarea
          className={styles.textarea}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={8}
        />
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
