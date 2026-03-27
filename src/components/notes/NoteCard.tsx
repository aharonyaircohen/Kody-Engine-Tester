'use client'

import type { Note } from '@/collections/notes'
import { TagBadge } from './TagBadge'
import styles from './NoteCard.module.css'

interface NoteCardProps {
  note: Note
  onClick: (id: string) => void
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  const preview = note.content.length > 100 ? note.content.slice(0, 100) + '...' : note.content

  return (
    <div className={styles.card} onClick={() => onClick(note.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(note.id) }} role="button" tabIndex={0}>
      <h3 className={styles.title}>{note.title}</h3>
      <p className={styles.content}>{preview}</p>
      <div className={styles.tags}>
        {note.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>
      <time className={styles.date}>{note.updatedAt.toLocaleDateString()}</time>
    </div>
  )
}
