import type { CollectionConfig } from 'payload'

export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

export interface CreateNoteInput {
  title: string
  content: string
  tags?: string[]
}

export type UpdateNoteInput = Partial<{ title: string; content: string; tags: string[] }>

export const Notes: CollectionConfig = {
  slug: 'notes',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'textarea', required: true },
    { name: 'tags', type: 'json' },
  ],
}

type RawNote = {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

function parseNote(raw: RawNote): Note {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  }
}

export class NotesStore {
  async getAll(): Promise<Note[]> {
    const res = await fetch('/api/notes')
    if (!res.ok) throw new Error('Failed to fetch notes')
    const raws: RawNote[] = await res.json()
    return raws.map(parseNote)
  }

  async getById(id: string): Promise<Note | null> {
    const res = await fetch(`/api/notes/${id}`)
    if (res.status === 404) return null
    if (!res.ok) throw new Error('Failed to fetch note')
    return parseNote(await res.json())
  }

  async create(input: CreateNoteInput): Promise<Note> {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error('Failed to create note')
    return parseNote(await res.json())
  }

  async update(id: string, input: UpdateNoteInput): Promise<Note> {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error('Failed to update note')
    return parseNote(await res.json())
  }

  async delete(id: string): Promise<boolean> {
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    return res.ok
  }

  async search(query: string): Promise<Note[]> {
    const res = await fetch(`/api/notes?q=${encodeURIComponent(query)}`)
    if (!res.ok) throw new Error('Failed to search notes')
    const raws: RawNote[] = await res.json()
    return raws.map(parseNote)
  }
}

export const notesStore = new NotesStore()
