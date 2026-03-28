'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { notesStore } from '@/collections/notes'
import { NoteForm } from '@/components/notes/NoteForm'

export default function NoteCreatePage() {
  const router = useRouter()

  async function handleSubmit(data: { title: string; content: string; tags: string[] }) {
    await notesStore.create(data)
    router.push('/notes')
  }

  return (
    <div style={{ padding: '40px', maxWidth: '700px', margin: '0 auto' }}>
      <Link href="/notes" style={{ color: '#6c63ff', textDecoration: 'none', fontSize: '0.9rem' }}>
        &larr; Back to notes
      </Link>
      <h1 style={{ color: '#e0e0e0', marginTop: '16px' }}>Create Note</h1>
      <NoteForm onSubmit={handleSubmit} submitLabel="Create Note" />
    </div>
  )
}
