'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { notesStore } from '@/collections/notes'
import { NoteCard } from '@/components/notes/NoteCard'
import { SearchBar } from '@/components/notes/SearchBar'
import { NotesBadge } from '@/components/notes/NotesBadge'

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
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ margin: 0, color: '#e0e0e0' }}>Notes</h1>
          <NotesBadge count={notes.length} />
        </div>
        <Link
          href="/notes/create"
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c63ff',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '0.9rem',
          }}
        >
          New Note
        </Link>
      </div>
      <div style={{ marginBottom: '24px' }}>
        <SearchBar value={searchInput} onChange={setSearchInput} />
      </div>
      {notes.length === 0 ? (
        <p style={{ color: '#666' }}>{searchQuery ? 'No notes match your search.' : 'No notes yet. Create your first note!'}</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onClick={(id) => router.push(`/notes/${id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}
