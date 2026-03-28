import { describe, it, expect } from 'vitest'
import { Notes } from './notes'
import type { CollectionConfig } from 'payload'

type AccessFn = (ctx?: { req: { user: unknown } }) => boolean

type AccessMap = {
  read?: AccessFn
  create?: AccessFn
  update?: AccessFn
  delete?: AccessFn
}

const authed = { req: { user: { id: '1', email: 'test@example.com' } } }
const anon = { req: { user: null } }

type FieldDef = { name: string; type: string; required?: boolean }

describe('Notes CollectionConfig', () => {
  it('should have slug "notes"', () => {
    expect(Notes.slug).toBe('notes')
  })

  it('should use title as the admin display field', () => {
    expect((Notes.admin as { useAsTitle?: string })?.useAsTitle).toBe('title')
  })

  it('should allow public read access', () => {
    const read = (Notes.access as AccessMap)?.read
    expect(typeof read).toBe('function')
    expect(read?.(anon)).toBe(true)
  })

  it('should deny create access to unauthenticated requests', () => {
    const create = (Notes.access as AccessMap)?.create
    expect(typeof create).toBe('function')
    expect(create?.(anon)).toBe(false)
  })

  it('should allow create access to authenticated users', () => {
    const create = (Notes.access as AccessMap)?.create
    expect(create?.(authed)).toBe(true)
  })

  it('should deny update access to unauthenticated requests', () => {
    const update = (Notes.access as AccessMap)?.update
    expect(typeof update).toBe('function')
    expect(update?.(anon)).toBe(false)
  })

  it('should allow update access to authenticated users', () => {
    const update = (Notes.access as AccessMap)?.update
    expect(update?.(authed)).toBe(true)
  })

  it('should deny delete access to unauthenticated requests', () => {
    const del = (Notes.access as AccessMap)?.delete
    expect(typeof del).toBe('function')
    expect(del?.(anon)).toBe(false)
  })

  it('should allow delete access to authenticated users', () => {
    const del = (Notes.access as AccessMap)?.delete
    expect(del?.(authed)).toBe(true)
  })

  it('should have a required text title field', () => {
    const fields = Notes.fields as FieldDef[]
    const field = fields.find((f) => f.name === 'title')
    expect(field).toBeDefined()
    expect(field?.type).toBe('text')
    expect(field?.required).toBe(true)
  })

  it('should have a required textarea content field', () => {
    const fields = Notes.fields as FieldDef[]
    const field = fields.find((f) => f.name === 'content')
    expect(field).toBeDefined()
    expect(field?.type).toBe('textarea')
    expect(field?.required).toBe(true)
  })

  it('should have a json tags field', () => {
    const fields = Notes.fields as FieldDef[]
    const field = fields.find((f) => f.name === 'tags')
    expect(field).toBeDefined()
    expect(field?.type).toBe('json')
  })

  it('should export a valid CollectionConfig shape', () => {
    const config: CollectionConfig = Notes
    expect(config).toHaveProperty('slug')
    expect(config).toHaveProperty('fields')
    expect(config).toHaveProperty('access')
  })
})
