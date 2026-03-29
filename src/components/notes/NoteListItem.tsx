'use client'

import type { Note } from '@/collections/notes'
import styles from './NoteListItem.module.css'

interface NoteListItemProps {
  note: Note
  selected: boolean
  onClick: (id: string) => void
}

function tagColor(tag: string): string {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) >>> 0
  }
  const hue = hash % 360
  return `hsl(${hue}, 65%, 55%)`
}

export function NoteListItem({ note, selected, onClick }: NoteListItemProps) {
  const firstLine = note.content.split('\n')[0]

  return (
    <div
      className={`${styles.item} ${selected ? styles.selected : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onClick(note.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick(note.id)
      }}
    >
      <div className={styles.main}>
        <span className={styles.title}>{note.title}</span>
        <span className={styles.preview}>{firstLine}</span>
      </div>
      <div className={styles.footer}>
        <div className={styles.dots}>
          {note.tags.map((tag) => (
            <span
              key={tag}
              className={styles.dot}
              style={{ backgroundColor: tagColor(tag) }}
              aria-label={tag}
              role="img"
            />
          ))}
        </div>
        <time className={styles.date}>{note.updatedAt.toLocaleDateString()}</time>
      </div>
    </div>
  )
}
