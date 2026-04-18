'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { notesStore } from '@/collections/notes'
import { TagBadge } from '@/components/notes/TagBadge'
import { ConfirmDialog } from '@/components/notes/ConfirmDialog'
import type { Note } from '@/collections/notes'

export default function NoteDetailPage() {
  const params = useParams<{ id: string }>()
  if (!params?.id) return null
  const { id } = params
  const router = useRouter()
  const [note, setNote] = useState<Note | null>(null)
  const [showDelete, setShowDelete] = useState(false)

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

  async function handleDelete() {
    await notesStore.delete(id)
    router.push('/notes')
  }

  return (
    <div style={{ padding: '40px', maxWidth: '700px', margin: '0 auto' }}>
      <Link href="/notes" style={{ color: '#6c63ff', textDecoration: 'none', fontSize: '0.9rem' }}>
        &larr; Back to notes
      </Link>
      <h1 style={{ color: '#e0e0e0', marginTop: '16px' }}>{note.title}</h1>
      <div style={{ marginBottom: '16px' }}>
        {note.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>
      <p style={{ color: '#c0c0c0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{note.content}</p>
      <div style={{ marginTop: '24px', fontSize: '0.8rem', color: '#666' }}>
        <p>Created: {note.createdAt.toLocaleString()}</p>
        <p>Updated: {note.updatedAt.toLocaleString()}</p>
      </div>
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <Link
          href={`/notes/edit/${id}`}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c63ff',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
          }}
        >
          Edit
        </Link>
        <button
          onClick={() => setShowDelete(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#e74c3c',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Delete
        </button>
      </div>
      <ConfirmDialog
        isOpen={showDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
