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

export class NotesStore {
  private notes: Map<string, Note> = new Map()

  getAll(): Note[] {
    return Array.from(this.notes.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    )
  }

  getById(id: string): Note | null {
    return this.notes.get(id) ?? null
  }

  create(input: CreateNoteInput): Note {
    const now = new Date()
    const note: Note = {
      id: crypto.randomUUID(),
      title: input.title,
      content: input.content,
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now,
    }
    this.notes.set(note.id, note)
    return note
  }

  update(id: string, input: UpdateNoteInput): Note {
    const note = this.notes.get(id)
    if (!note) {
      throw new Error(`Note with id "${id}" not found`)
    }
    const updated: Note = {
      ...note,
      ...input,
      updatedAt: new Date(),
    }
    this.notes.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.notes.delete(id)
  }

  search(query: string): Note[] {
    const lower = query.toLowerCase()
    return this.getAll().filter(
      (note) =>
        note.title.toLowerCase().includes(lower) || note.content.toLowerCase().includes(lower),
    )
  }
}

export const notesStore = new NotesStore()
