'use client'

import Link from 'next/link'
import type { Note } from '@/collections/notes'
import { TagBadge } from './TagBadge'
import styles from './NotePreview.module.css'

interface NotePreviewProps {
  note: Note | null
}

export function NotePreview({ note }: NotePreviewProps) {
  if (!note) {
    return (
      <div className={styles.placeholder}>
        <p>Select a note to preview it here.</p>
      </div>
    )
  }

  return (
    <div className={styles.preview}>
      <div className={styles.header}>
        <h2 className={styles.title}>{note.title}</h2>
        <Link href={`/notes/edit/${note.id}`} className={styles.editLink}>
          Edit
        </Link>
      </div>
      {note.tags.length > 0 && (
        <div className={styles.tags}>
          {note.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
      <div className={styles.content}>
        <p>{note.content}</p>
      </div>
    </div>
  )
}
