'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { notesStore } from '@/collections/notes'
import { NoteForm } from '@/components/notes/NoteForm'
import type { Note } from '@/collections/notes'

export default function NoteEditPage() {
  const { id } = useParams<{ id: string }>() as { id: string }
  const router = useRouter()
  const [note, setNote] = useState<Note | null>(null)

  useEffect(() => {
    notesStore.getById(id).then(setNote)
  }, [id])

  if (!note) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <h1>Note not found</h1>
        <Link href="/notes" style={{ color: '#6c63ff' }}>Back to notes</Link>
      </div>
    )
  }

  async function handleSubmit(data: { title: string; content: string; tags: string[] }) {
    await notesStore.update(id, data)
    router.push(`/notes/${id}`)
  }

  return (
    <div style={{ padding: '40px', maxWidth: '700px', margin: '0 auto' }}>
      <Link href={`/notes/${id}`} style={{ color: '#6c63ff', textDecoration: 'none', fontSize: '0.9rem' }}>
        &larr; Back to note
      </Link>
      <h1 style={{ color: '#e0e0e0', marginTop: '16px' }}>Edit Note</h1>
      <NoteForm
        initialValues={{ title: note.title, content: note.content, tags: note.tags }}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  )
}
