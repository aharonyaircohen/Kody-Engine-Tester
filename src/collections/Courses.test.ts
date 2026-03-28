import { describe, it, expect } from 'vitest'
import type { AccessArgs, Field } from 'payload'

import { Courses } from './Courses'

// Helper to find a named field from the collection (Payload uses Field[] which includes non-named types)
function findField(name: string): Field | undefined {
  return Courses.fields.find((f) => 'name' in f && f.name === name) as Field | undefined
}

// --- Collection Config Structure Tests ---

describe('Courses collection config', () => {
  it('should export a Courses collection config', () => {
    expect(Courses).toBeDefined()
    expect(typeof Courses).toBe('object')
  })

  it('should have slug set to "courses"', () => {
    expect(Courses.slug).toBe('courses')
  })

  it('should have a title field that is required and unique', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const titleField = findField('title') as any
    expect(titleField).toBeDefined()
    expect(titleField.type).toBe('text')
    expect(titleField.required).toBe(true)
    expect(titleField.unique).toBe(true)
  })

  it('should have a slug field auto-generated from title', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const slugField = findField('slug') as any
    expect(slugField).toBeDefined()
    expect(slugField.type).toBe('text')
    expect(slugField.admin?.readOnly).toBe(true)
  })

  it('should have a description field that is a richText editor and required', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const descField = findField('description') as any
    expect(descField).toBeDefined()
    expect(descField.type).toBe('richText')
    expect(descField.required).toBe(true)
  })

  it('should have a thumbnail field that is a relationship to Media', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const thumbField = findField('thumbnail') as any
    expect(thumbField).toBeDefined()
    expect(thumbField.type).toBe('relationship')
    expect(thumbField.relationTo).toBe('media')
  })

  it('should have an instructor field that is a required relationship to Users', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instField = findField('instructor') as any
    expect(instField).toBeDefined()
    expect(instField.type).toBe('relationship')
    expect(instField.relationTo).toBe('users')
    expect(instField.required).toBe(true)
  })

  it('should have a status select field with draft/published/archived options, defaulting to draft', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statusField = findField('status') as any
    expect(statusField).toBeDefined()
    expect(statusField.type).toBe('select')
    expect(statusField.options).toEqual(['draft', 'published', 'archived'])
    expect(statusField.defaultValue).toBe('draft')
  })

  it('should have a difficulty select field with beginner/intermediate/advanced options', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const diffField = findField('difficulty') as any
    expect(diffField).toBeDefined()
    expect(diffField.type).toBe('select')
    expect(diffField.options).toEqual(['beginner', 'intermediate', 'advanced'])
  })

  it('should have an estimatedHours number field', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hoursField = findField('estimatedHours') as any
    expect(hoursField).toBeDefined()
    expect(hoursField.type).toBe('number')
  })

  it('should have a tags array field of text', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tagsField = findField('tags') as any
    expect(tagsField).toBeDefined()
    expect(tagsField.type).toBe('array')
    expect(tagsField.fields).toBeDefined()
    const labelField = tagsField.fields.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (f: any) => f.name === 'label',
    )
    expect(labelField).toBeDefined()
    expect(labelField.type).toBe('text')
  })

  it('should have a maxEnrollments number field', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maxField = findField('maxEnrollments') as any
    expect(maxField).toBeDefined()
    expect(maxField.type).toBe('number')
  })

  it('should have hooks on the slug field for auto-generation from title', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const slugField = findField('slug') as any
    expect(slugField).toBeDefined()
    expect(slugField.hooks).toBeDefined()
    expect(Array.isArray(slugField.hooks?.beforeChange)).toBe(true)
    expect(slugField.hooks?.beforeChange.length).toBeGreaterThan(0)
  })

  it('should have access control defined', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const access = Courses.access as any
    expect(access).toBeDefined()
    expect(typeof access.create).toBe('function')
    expect(typeof access.update).toBe('function')
    expect(typeof access.read).toBe('function')
  })
})

// --- Access Control Tests ---

function makeMockReq(
  overrides: Partial<{
    user: { id: string; collection: string; role: string } | null
  }> = {},
): AccessArgs['req'] {
  return {
    user: null,
    ...overrides,
  } as AccessArgs['req']
}

describe('Courses access control - create', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canCreate = (Courses.access as any)?.create

  it('should deny create when no user is logged in', async () => {
    const req = makeMockReq({ user: null })
    const result = await canCreate!({ req } as AccessArgs)
    expect(result).toBe(false)
  })

  it('should deny create when user is a student', async () => {
    const req = makeMockReq({ user: { id: 'u1', collection: 'users', role: 'student' } })
    const result = await canCreate!({ req } as AccessArgs)
    expect(result).toBe(false)
  })

  it('should allow create when user is an instructor', async () => {
    const req = makeMockReq({ user: { id: 'u1', collection: 'users', role: 'instructor' } })
    const result = await canCreate!({ req } as AccessArgs)
    expect(result).toBe(true)
  })

  it('should allow create when user is an admin', async () => {
    const req = makeMockReq({ user: { id: 'u1', collection: 'users', role: 'admin' } })
    const result = await canCreate!({ req } as AccessArgs)
    expect(result).toBe(true)
  })
})

describe('Courses access control - update', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canUpdate = (Courses.access as any)?.update

  it('should deny update when no user is logged in', async () => {
    const req = makeMockReq({ user: null })
    const result = await canUpdate!({ req } as AccessArgs)
    expect(result).toBe(false)
  })

  it('should deny update when user is a student', async () => {
    const req = makeMockReq({ user: { id: 'u1', collection: 'users', role: 'student' } })
    const result = await canUpdate!({ req } as AccessArgs)
    expect(result).toBe(false)
  })

  it('should allow admin to update any course', async () => {
    const req = makeMockReq({ user: { id: 'admin1', collection: 'users', role: 'admin' } })
    const result = await canUpdate!({ req } as AccessArgs)
    expect(result).toBe(true)
  })

  it('should deny instructor update when doc does not belong to them', async () => {
    const req = makeMockReq({ user: { id: 'instructor2', collection: 'users', role: 'instructor' } })
    const doc = { instructor: { id: 'instructor1' } }
    const result = await canUpdate!({ req, data: doc } as AccessArgs & { data: { instructor: { id: string } } })
    expect(result).toBe(false)
  })

  it('should allow instructor to update their own course', async () => {
    const req = makeMockReq({ user: { id: 'instructor1', collection: 'users', role: 'instructor' } })
    const doc = { instructor: { id: 'instructor1' } }
    const result = await canUpdate!({ req, data: doc } as AccessArgs & { data: { instructor: { id: string } } })
    expect(result).toBe(true)
  })
})

describe('Courses access control - read', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canRead = (Courses.access as any)?.read

  it('should deny read when no user is logged in', async () => {
    const req = makeMockReq({ user: null })
    const result = await canRead!({ req } as AccessArgs)
    expect(result).toBe(false)
  })

  it('should allow read of published courses to any authenticated user', async () => {
    const req = makeMockReq({ user: { id: 'student1', collection: 'users', role: 'student' } })
    const doc = { status: 'published' }
    const result = await canRead!({ req, doc } as AccessArgs & { doc: { status: string } })
    expect(result).toBe(true)
  })

  it('should deny read of draft courses to students', async () => {
    const req = makeMockReq({ user: { id: 'student1', collection: 'users', role: 'student' } })
    const doc = { status: 'draft', instructor: { id: 'instructor1' } }
    const result = await canRead!({ req, doc } as AccessArgs & { doc: { status: string; instructor: { id: string } } })
    expect(result).toBe(false)
  })

  it('should allow instructor to read their own draft course', async () => {
    const req = makeMockReq({ user: { id: 'instructor1', collection: 'users', role: 'instructor' } })
    const doc = { status: 'draft', instructor: { id: 'instructor1' } }
    const result = await canRead!({ req, doc } as AccessArgs & { doc: { status: string; instructor: { id: string } } })
    expect(result).toBe(true)
  })

  it('should allow admin to read any draft course', async () => {
    const req = makeMockReq({ user: { id: 'admin1', collection: 'users', role: 'admin' } })
    const doc = { status: 'draft', instructor: { id: 'instructor1' } }
    const result = await canRead!({ req, doc } as AccessArgs & { doc: { status: string; instructor: { id: string } } })
    expect(result).toBe(true)
  })

  it('should deny instructor read of another instructor draft course', async () => {
    const req = makeMockReq({ user: { id: 'instructor2', collection: 'users', role: 'instructor' } })
    const doc = { status: 'draft', instructor: { id: 'instructor1' } }
    const result = await canRead!({ req, doc } as AccessArgs & { doc: { status: string; instructor: { id: string } } })
    expect(result).toBe(false)
  })
})
