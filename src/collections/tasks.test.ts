import { describe, it, expect, beforeEach } from 'vitest'
import { TaskStore } from './tasks'

describe('TaskStore', () => {
  let store: TaskStore

  beforeEach(() => {
    store = new TaskStore()
  })

  describe('create', () => {
    it('should create a task with all fields', () => {
      const task = store.create({ title: 'Test Task', description: 'Body', priority: 'high', assignee: 'Alice' })
      expect(task.id).toBeDefined()
      expect(task.title).toBe('Test Task')
      expect(task.description).toBe('Body')
      expect(task.status).toBe('todo')
      expect(task.priority).toBe('high')
      expect(task.assignee).toBe('Alice')
      expect(task.createdAt).toBeInstanceOf(Date)
      expect(task.updatedAt).toBeInstanceOf(Date)
    })

    it('should default optional fields', () => {
      const task = store.create({ title: 'Simple Task' })
      expect(task.description).toBe('')
      expect(task.priority).toBe('medium')
      expect(task.assignee).toBeNull()
    })

    it('should assign incrementing order values', () => {
      const t1 = store.create({ title: 'Task 1' })
      const t2 = store.create({ title: 'Task 2' })
      const t3 = store.create({ title: 'Task 3' })
      expect(t1.order).toBe(0)
      expect(t2.order).toBe(1)
      expect(t3.order).toBe(2)
    })
  })

  describe('getAll', () => {
    it('should return all tasks sorted by order asc', () => {
      const t1 = store.create({ title: 'First' })
      const t2 = store.create({ title: 'Second' })
      const all = store.getAll()
      expect(all).toHaveLength(2)
      expect(all[0].id).toBe(t1.id)
      expect(all[1].id).toBe(t2.id)
    })

    it('should return empty array when no tasks exist', () => {
      expect(store.getAll()).toEqual([])
    })
  })

  describe('getById', () => {
    it('should return a task by id', () => {
      const created = store.create({ title: 'Test Task' })
      const found = store.getById(created.id)
      expect(found).toEqual(created)
    })

    it('should return null for non-existent id', () => {
      expect(store.getById('non-existent')).toBeNull()
    })
  })

  describe('update', () => {
    it('should update partial fields', () => {
      const task = store.create({ title: 'Old', description: 'Desc', priority: 'low' })
      const updated = store.update(task.id, { title: 'New', priority: 'high' })
      expect(updated.title).toBe('New')
      expect(updated.description).toBe('Desc')
      expect(updated.priority).toBe('high')
    })

    it('should set new updatedAt', async () => {
      const task = store.create({ title: 'Test Task' })
      await new Promise((r) => setTimeout(r, 10))
      const updated = store.update(task.id, { title: 'Updated' })
      expect(updated.updatedAt.getTime()).toBeGreaterThan(task.updatedAt.getTime())
    })

    it('should throw for non-existent id', () => {
      expect(() => store.update('missing', { title: 'X' })).toThrow('Task with id "missing" not found')
    })
  })

  describe('delete', () => {
    it('should delete an existing task and return true', () => {
      const task = store.create({ title: 'Test Task' })
      expect(store.delete(task.id)).toBe(true)
      expect(store.getById(task.id)).toBeNull()
    })

    it('should return false for non-existent id', () => {
      expect(store.delete('missing')).toBe(false)
    })
  })

  describe('filterByStatus', () => {
    beforeEach(() => {
      store.create({ title: 'Task 1' })
      store.create({ title: 'Task 2', description: '', priority: 'medium' })
      store.create({ title: 'Task 3', description: '', priority: 'medium' })
      const t2 = store.getAll()[1]
      const t3 = store.getAll()[2]
      store.update(t2.id, { status: 'in-progress' })
      store.update(t3.id, { status: 'done' })
    })

    it('should filter by todo', () => {
      const results = store.filterByStatus('todo')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Task 1')
    })

    it('should filter by in-progress', () => {
      const results = store.filterByStatus('in-progress')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Task 2')
    })

    it('should filter by done', () => {
      const results = store.filterByStatus('done')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Task 3')
    })
  })

  describe('filterByPriority', () => {
    beforeEach(() => {
      store.create({ title: 'Low Task', priority: 'low' })
      store.create({ title: 'Medium Task', priority: 'medium' })
      store.create({ title: 'High Task', priority: 'high' })
    })

    it('should filter by low priority', () => {
      const results = store.filterByPriority('low')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Low Task')
    })

    it('should filter by medium priority', () => {
      const results = store.filterByPriority('medium')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Medium Task')
    })

    it('should filter by high priority', () => {
      const results = store.filterByPriority('high')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('High Task')
    })
  })

  describe('filterByAssignee', () => {
    beforeEach(() => {
      store.create({ title: 'Task A', assignee: 'Alice' })
      store.create({ title: 'Task B', assignee: 'Bob' })
      store.create({ title: 'Task C', assignee: 'Alice' })
    })

    it('should filter by assignee', () => {
      const results = store.filterByAssignee('Alice')
      expect(results).toHaveLength(2)
      expect(results.every((t) => t.assignee === 'Alice')).toBe(true)
    })

    it('should return empty for unassigned', () => {
      const results = store.filterByAssignee('Carol')
      expect(results).toHaveLength(0)
    })
  })

  describe('moveTask', () => {
    it('should update task status', () => {
      const task = store.create({ title: 'Test Task' })
      const moved = store.moveTask(task.id, 'in-progress')
      expect(moved.status).toBe('in-progress')
    })

    it('should throw for non-existent id', () => {
      expect(() => store.moveTask('missing', 'done')).toThrow('Task with id "missing" not found')
    })
  })

  describe('reorderInColumn', () => {
    it('should update task order', () => {
      const task = store.create({ title: 'Test Task' })
      const reordered = store.reorderInColumn(task.id, 5)
      expect(reordered.order).toBe(5)
    })

    it('should throw for non-existent id', () => {
      expect(() => store.reorderInColumn('missing', 0)).toThrow('Task with id "missing" not found')
    })
  })
})
