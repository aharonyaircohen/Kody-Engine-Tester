import { describe, it, expect, beforeEach } from 'vitest'
import { ModuleStore } from './Modules'

describe('ModuleStore', () => {
  let store: ModuleStore

  beforeEach(() => {
    store = new ModuleStore()
  })

  describe('create', () => {
    it('should create a module with all fields', () => {
      const mod = store.create({
        title: 'Intro to React',
        courseId: 'course-1',
        order: 0,
        description: 'Getting started',
      })
      expect(mod.id).toBeDefined()
      expect(mod.title).toBe('Intro to React')
      expect(mod.courseId).toBe('course-1')
      expect(mod.order).toBe(0)
      expect(mod.description).toBe('Getting started')
      expect(mod.createdAt).toBeInstanceOf(Date)
      expect(mod.updatedAt).toBeInstanceOf(Date)
    })

    it('should throw if courseId is missing', () => {
      expect(() =>
        store.create({ title: 'Module', courseId: '', order: 0 }),
      ).toThrow('courseId is required')
    })

    it('should throw if courseId is undefined', () => {
      expect(() =>
        // @ts-expect-error testing runtime validation
        store.create({ title: 'Module', courseId: undefined, order: 0 }),
      ).toThrow('courseId is required')
    })

    it('should auto-assign order as max+1 per course when not provided', () => {
      store.create({ title: 'Mod 1', courseId: 'course-1', description: '' })
      store.create({ title: 'Mod 2', courseId: 'course-1', description: '' })
      store.create({ title: 'Mod 3', courseId: 'course-1', description: '' })
      const mods = store.getByCourse('course-1')
      expect(mods[0].order).toBe(0)
      expect(mods[1].order).toBe(1)
      expect(mods[2].order).toBe(2)
    })

    it('should use explicit order when provided', () => {
      const mod = store.create({ title: 'Custom Order', courseId: 'course-1', order: 99 })
      expect(mod.order).toBe(99)
    })
  })

  describe('getAll', () => {
    it('should return all modules sorted by order asc', () => {
      store.create({ title: 'Mod B', courseId: 'c1', order: 1 })
      store.create({ title: 'Mod A', courseId: 'c1', order: 0 })
      const all = store.getAll()
      expect(all).toHaveLength(2)
      expect(all[0].title).toBe('Mod A')
      expect(all[1].title).toBe('Mod B')
    })

    it('should return empty array when no modules exist', () => {
      expect(store.getAll()).toEqual([])
    })
  })

  describe('getById', () => {
    it('should return a module by id', () => {
      const created = store.create({ title: 'Test', courseId: 'c1', description: '' })
      const found = store.getById(created.id)
      expect(found).toEqual(created)
    })

    it('should return null for non-existent id', () => {
      expect(store.getById('non-existent')).toBeNull()
    })
  })

  describe('getByCourse', () => {
    beforeEach(() => {
      store.create({ title: 'Mod 1', courseId: 'course-a', order: 0 })
      store.create({ title: 'Mod 2', courseId: 'course-a', order: 1 })
      store.create({ title: 'Mod 3', courseId: 'course-b', order: 0 })
    })

    it('should return modules for a course sorted by order asc', () => {
      const mods = store.getByCourse('course-a')
      expect(mods).toHaveLength(2)
      expect(mods[0].title).toBe('Mod 1')
      expect(mods[1].title).toBe('Mod 2')
    })

    it('should return empty array for course with no modules', () => {
      expect(store.getByCourse('course-c')).toEqual([])
    })
  })

  describe('update', () => {
    it('should update partial fields', () => {
      const mod = store.create({ title: 'Old', courseId: 'c1', description: 'Desc', order: 0 })
      const updated = store.update(mod.id, { title: 'New' })
      expect(updated.title).toBe('New')
      expect(updated.description).toBe('Desc')
    })

    it('should set new updatedAt', async () => {
      const mod = store.create({ title: 'Test', courseId: 'c1', description: '' })
      await new Promise((r) => setTimeout(r, 10))
      const updated = store.update(mod.id, { title: 'Updated' })
      expect(updated.updatedAt.getTime()).toBeGreaterThan(mod.updatedAt.getTime())
    })

    it('should throw for non-existent id', () => {
      expect(() => store.update('missing', { title: 'X' })).toThrow(
        'Module with id "missing" not found',
      )
    })

    it('should throw if courseId is updated to empty string', () => {
      const mod = store.create({ title: 'Test', courseId: 'c1', description: '' })
      expect(() => store.update(mod.id, { courseId: '' })).toThrow('courseId is required')
    })
  })

  describe('delete', () => {
    it('should delete an existing module and return true', () => {
      const mod = store.create({ title: 'Test', courseId: 'c1', description: '' })
      expect(store.delete(mod.id)).toBe(true)
      expect(store.getById(mod.id)).toBeNull()
    })

    it('should return false for non-existent id', () => {
      expect(store.delete('missing')).toBe(false)
    })
  })

  describe('ordering logic', () => {
    it('should maintain correct order across multiple courses', () => {
      store.create({ title: 'Course1 ModA', courseId: 'course1', order: 0 })
      store.create({ title: 'Course1 ModB', courseId: 'course1', order: 1 })
      store.create({ title: 'Course2 ModA', courseId: 'course2', order: 0 })

      const c1 = store.getByCourse('course1')
      const c2 = store.getByCourse('course2')

      expect(c1).toHaveLength(2)
      expect(c1[0].order).toBe(0)
      expect(c1[1].order).toBe(1)
      expect(c2).toHaveLength(1)
      expect(c2[0].order).toBe(0)
    })

    it('should allow reordering a module by updating its order field', () => {
      store.create({ title: 'Mod 1', courseId: 'c1', order: 0 })
      store.create({ title: 'Mod 2', courseId: 'c1', order: 1 })
      store.create({ title: 'Mod 3', courseId: 'c1', order: 2 })

      const mod1 = store.getByCourse('c1')[0]
      store.update(mod1.id, { order: 99 })

      const updated = store.getByCourse('c1')
      expect(updated[0].title).toBe('Mod 2')
      expect(updated[0].order).toBe(1)
      expect(updated[2].title).toBe('Mod 1')
      expect(updated[2].order).toBe(99)
    })
  })
})
