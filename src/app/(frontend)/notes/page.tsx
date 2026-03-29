'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { notesStore } from '@/collections/notes'
import { NoteCard } from '@/components/notes/NoteCard'
import { SearchBar } from '@/components/notes/SearchBar'
import styles from './notes.module.css'

export default function NotesListPage() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const notes = useMemo(
    () => (searchQuery ? notesStore.search(searchQuery) : notesStore.getAll()),
    [searchQuery],
  )

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>← Back</Link>
      <div className={styles.header}>
        <h1 className={styles.title}>Notes</h1>
        <Link href="/notes/create" className={styles.newNoteButton}>
          New Note
        </Link>
      </div>
      <div className={styles.searchWrapper}>
        <SearchBar value={searchInput} onChange={setSearchInput} />
      </div>
      {notes.length === 0 ? (
        <p className={styles.empty}>{searchQuery ? 'No notes match your search.' : 'No notes yet. Create your first note!'}</p>
      ) : (
        <div className={styles.grid}>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onClick={(id) => router.push(`/notes/${id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}
