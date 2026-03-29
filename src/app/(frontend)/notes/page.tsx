'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { notesStore } from '@/collections/notes'
import { NoteListItem } from '@/components/notes/NoteListItem'
import { NotePreview } from '@/components/notes/NotePreview'
import { SearchBar } from '@/components/notes/SearchBar'
import styles from './notes.module.css'

export default function NotesListPage() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const notes = useMemo(
    () => (searchQuery ? notesStore.search(searchQuery) : notesStore.getAll()),
    [searchQuery],
  )

  const selectedNote = useMemo(
    () => (selectedId ? notes.find((n) => n.id === selectedId) ?? null : null),
    [selectedId, notes],
  )

  function handleNoteClick(id: string) {
    if (window.matchMedia('(max-width: 767px)').matches) {
      router.push(`/notes/${id}`)
    } else {
      setSelectedId(id)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>Notes</h1>
        <Link href="/notes/create" className={styles.newNoteLink}>
          New Note
        </Link>
      </div>
      <div className={styles.searchWrapper}>
        <SearchBar value={searchInput} onChange={setSearchInput} />
      </div>
      <div className={styles.masterDetail}>
        <div className={styles.listPanel}>
          {notes.length === 0 ? (
            <p className={styles.empty}>
              {searchQuery ? 'No notes match your search.' : 'No notes yet. Create your first note!'}
            </p>
          ) : (
            notes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                selected={note.id === selectedId}
                onClick={handleNoteClick}
              />
            ))
          )}
        </div>
        <div className={styles.previewPanel}>
          <NotePreview note={selectedNote} />
        </div>
      </div>
    </div>
  )
}
