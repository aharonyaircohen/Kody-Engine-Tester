import { describe, it, expect, beforeEach } from 'vitest'
import { LessonStore } from './Lessons'

describe('LessonStore', () => {
  let store: LessonStore

  beforeEach(() => {
    store = new LessonStore()
  })

  describe('create', () => {
    it('should create a lesson with all fields', () => {
      const lesson = store.create({
        title: 'What is React?',
        moduleId: 'module-1',
        order: 0,
        type: 'video',
        content: '<p>React is a library</p>',
        videoUrl: 'https://youtube.com/watch?v=abc',
        estimatedMinutes: 10,
      })
      expect(lesson.id).toBeDefined()
      expect(lesson.title).toBe('What is React?')
      expect(lesson.moduleId).toBe('module-1')
      expect(lesson.order).toBe(0)
      expect(lesson.type).toBe('video')
      expect(lesson.content).toBe('<p>React is a library</p>')
      expect(lesson.videoUrl).toBe('https://youtube.com/watch?v=abc')
      expect(lesson.estimatedMinutes).toBe(10)
      expect(lesson.createdAt).toBeInstanceOf(Date)
      expect(lesson.updatedAt).toBeInstanceOf(Date)
    })

    it('should default optional fields', () => {
      const lesson = store.create({
        title: 'Simple Lesson',
        moduleId: 'module-1',
      })
      expect(lesson.type).toBe('text')
      expect(lesson.content).toBe('')
      expect(lesson.videoUrl).toBeNull()
      expect(lesson.estimatedMinutes).toBeNull()
    })

    it('should throw if moduleId is missing', () => {
      expect(() =>
        store.create({ title: 'Lesson', moduleId: '' }),
      ).toThrow('moduleId is required')
    })

    it('should throw if moduleId is undefined', () => {
      expect(() =>
        // @ts-expect-error testing runtime validation
        store.create({ title: 'Lesson', moduleId: undefined }),
      ).toThrow('moduleId is required')
    })

    it('should auto-assign order as max+1 per module when not provided', () => {
      store.create({ title: 'Lesson 1', moduleId: 'mod-1' })
      store.create({ title: 'Lesson 2', moduleId: 'mod-1' })
      store.create({ title: 'Lesson 3', moduleId: 'mod-1' })
      const lessons = store.getByModule('mod-1')
      expect(lessons[0].order).toBe(0)
      expect(lessons[1].order).toBe(1)
      expect(lessons[2].order).toBe(2)
    })

    it('should use explicit order when provided', () => {
      const lesson = store.create({
        title: 'Custom Order',
        moduleId: 'mod-1',
        order: 5,
      })
      expect(lesson.order).toBe(5)
    })
  })

  describe('getAll', () => {
    it('should return all lessons sorted by order asc', () => {
      store.create({ title: 'Lesson B', moduleId: 'm1', order: 1 })
      store.create({ title: 'Lesson A', moduleId: 'm1', order: 0 })
      const all = store.getAll()
      expect(all).toHaveLength(2)
      expect(all[0].title).toBe('Lesson A')
      expect(all[1].title).toBe('Lesson B')
    })

    it('should return empty array when no lessons exist', () => {
      expect(store.getAll()).toEqual([])
    })
  })

  describe('getById', () => {
    it('should return a lesson by id', () => {
      const created = store.create({ title: 'Test', moduleId: 'm1' })
      const found = store.getById(created.id)
      expect(found).toEqual(created)
    })

    it('should return null for non-existent id', () => {
      expect(store.getById('non-existent')).toBeNull()
    })
  })

  describe('getByModule', () => {
    beforeEach(() => {
      store.create({ title: 'L1', moduleId: 'mod-a', order: 0 })
      store.create({ title: 'L2', moduleId: 'mod-a', order: 1 })
      store.create({ title: 'L3', moduleId: 'mod-b', order: 0 })
    })

    it('should return lessons for a module sorted by order asc', () => {
      const lessons = store.getByModule('mod-a')
      expect(lessons).toHaveLength(2)
      expect(lessons[0].title).toBe('L1')
      expect(lessons[1].title).toBe('L2')
    })

    it('should return empty array for module with no lessons', () => {
      expect(store.getByModule('mod-c')).toEqual([])
    })
  })

  describe('update', () => {
    it('should update partial fields', () => {
      const lesson = store.create({
        title: 'Old',
        moduleId: 'm1',
        type: 'text',
        content: 'Body',
      })
      const updated = store.update(lesson.id, { title: 'New' })
      expect(updated.title).toBe('New')
      expect(updated.content).toBe('Body')
      expect(updated.type).toBe('text')
    })

    it('should update type and clear videoUrl when switching away from video', () => {
      const lesson = store.create({
        title: 'Video Lesson',
        moduleId: 'm1',
        type: 'video',
        videoUrl: 'https://youtube.com/watch?v=123',
      })
      const updated = store.update(lesson.id, { type: 'text' })
      expect(updated.type).toBe('text')
      expect(updated.videoUrl).toBeNull()
    })

    it('should set new updatedAt', async () => {
      const lesson = store.create({ title: 'Test', moduleId: 'm1' })
      await new Promise((r) => setTimeout(r, 10))
      const updated = store.update(lesson.id, { title: 'Updated' })
      expect(updated.updatedAt.getTime()).toBeGreaterThan(lesson.updatedAt.getTime())
    })

    it('should throw for non-existent id', () => {
      expect(() => store.update('missing', { title: 'X' })).toThrow(
        'Lesson with id "missing" not found',
      )
    })

    it('should throw if moduleId is updated to empty string', () => {
      const lesson = store.create({ title: 'Test', moduleId: 'm1' })
      expect(() => store.update(lesson.id, { moduleId: '' })).toThrow(
        'moduleId is required',
      )
    })
  })

  describe('delete', () => {
    it('should delete an existing lesson and return true', () => {
      const lesson = store.create({ title: 'Test', moduleId: 'm1' })
      expect(store.delete(lesson.id)).toBe(true)
      expect(store.getById(lesson.id)).toBeNull()
    })

    it('should return false for non-existent id', () => {
      expect(store.delete('missing')).toBe(false)
    })
  })

  describe('search', () => {
    beforeEach(() => {
      // lesson A: 5 min, order 0
      store.create({ title: 'Intro to React', moduleId: 'mod-a', order: 0, estimatedMinutes: 5 })
      // lesson B: 15 min, order 1
      store.create({ title: 'Advanced Hooks', moduleId: 'mod-a', order: 1, estimatedMinutes: 15 })
      // lesson C: null min, order 2
      store.create({ title: 'Context API Deep Dive', moduleId: 'mod-a', order: 2, estimatedMinutes: null })
      // lesson D: 8 min, order 3
      store.create({ title: 'Performance Tips', moduleId: 'mod-a', order: 3, estimatedMinutes: 8 })
      // lesson E: 30 min, different module
      store.create({ title: 'Testing React Apps', moduleId: 'mod-b', order: 0, estimatedMinutes: 30 })
    })

    it('should return all lessons ordered by order when no filters are given', () => {
      const results = store.search({}, 'mod-a')
      expect(results).toHaveLength(4)
      expect(results.map((l) => l.title)).toEqual([
        'Intro to React',
        'Advanced Hooks',
        'Context API Deep Dive',
        'Performance Tips',
      ])
    })

    it('should filter by query case-insensitively with partial substring', () => {
      const results = store.search({ query: 'react' }, 'mod-a')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Intro to React')

      // case-insensitive: 'ADVANCED' matches 'Advanced'
      const results2 = store.search({ query: 'AdVaNced' }, 'mod-a')
      expect(results2).toHaveLength(1)
      expect(results2[0].title).toBe('Advanced Hooks')
    })

    it('should return all lessons in module when query matches all', () => {
      const results = store.search({ query: 'e' }, 'mod-a')
      expect(results).toHaveLength(4)
    })

    it('should return empty array when query matches nothing', () => {
      const results = store.search({ query: 'zzznomatch' }, 'mod-a')
      expect(results).toHaveLength(0)
    })

    it('should filter by maxMinutes — excludes lessons over the threshold', () => {
      const results = store.search({ maxMinutes: 10 }, 'mod-a')
      expect(results.map((l) => l.title)).toEqual([
        'Intro to React',      // 5 <= 10
        'Context API Deep Dive', // null — always included
        'Performance Tips',     // 8 <= 10
      ])
      expect(results.map((l) => l.title)).not.toContain('Advanced Hooks') // 15 > 10
    })

    it('should include lessons with null estimatedMinutes even when maxMinutes is set', () => {
      const results = store.search({ maxMinutes: 5 }, 'mod-a')
      const nullLesson = results.find((l) => l.title === 'Context API Deep Dive')
      expect(nullLesson).toBeDefined()
    })

    it('should combine both filters with AND semantics', () => {
      const results = store.search({ query: 'i', maxMinutes: 10 }, 'mod-a')
      // "i" matches: Intro to React, Advanced Hooks, Context API Deep Dive, Performance Tips
      // maxMinutes 10: Intro(5), Context(null), Performance(8)
      // Intersection: Intro, Context, Performance
      expect(results.map((l) => l.title)).toEqual([
        'Intro to React',
        'Context API Deep Dive',
        'Performance Tips',
      ])
      expect(results.map((l) => l.title)).not.toContain('Advanced Hooks') // "i" matches but 15 > 10
    })

    it('should search across all modules when moduleId is omitted', () => {
      const results = store.search({ maxMinutes: 10 })
      expect(results).toHaveLength(3) // only mod-a ones; mod-b Testing = 30 > 10
      expect(results.map((l) => l.title)).not.toContain('Testing React Apps')
    })
  })

  describe('ordering logic', () => {
    it('should maintain correct order across multiple modules', () => {
      store.create({ title: 'Mod1 Lesson A', moduleId: 'module1', order: 0 })
      store.create({ title: 'Mod1 Lesson B', moduleId: 'module1', order: 1 })
      store.create({ title: 'Mod2 Lesson A', moduleId: 'module2', order: 0 })

      const m1 = store.getByModule('module1')
      const m2 = store.getByModule('module2')

      expect(m1).toHaveLength(2)
      expect(m1[0].order).toBe(0)
      expect(m1[1].order).toBe(1)
      expect(m2).toHaveLength(1)
      expect(m2[0].order).toBe(0)
    })

    it('should allow reordering a lesson by updating its order field', () => {
      store.create({ title: 'L1', moduleId: 'm1', order: 0 })
      store.create({ title: 'L2', moduleId: 'm1', order: 1 })
      store.create({ title: 'L3', moduleId: 'm1', order: 2 })

      const l1 = store.getByModule('m1')[0]
      store.update(l1.id, { order: 99 })

      const updated = store.getByModule('m1')
      expect(updated[0].title).toBe('L2')
      expect(updated[0].order).toBe(1)
      expect(updated[2].title).toBe('L1')
      expect(updated[2].order).toBe(99)
    })
  })
})
