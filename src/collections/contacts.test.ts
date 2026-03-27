import { describe, it, expect, beforeEach } from 'vitest'
import { ContactStore } from './contacts'

describe('ContactStore', () => {
  let store: ContactStore

  beforeEach(() => {
    store = new ContactStore(false)
  })

  describe('create', () => {
    it('should create a contact with all fields', () => {
      const contact = store.create({
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        phone: '555-1234',
        company: 'Acme',
        role: 'Engineer',
        tags: ['engineering', 'frontend'],
      })
      expect(contact.id).toBeDefined()
      expect(contact.firstName).toBe('Alice')
      expect(contact.lastName).toBe('Smith')
      expect(contact.email).toBe('alice@example.com')
      expect(contact.phone).toBe('555-1234')
      expect(contact.company).toBe('Acme')
      expect(contact.role).toBe('Engineer')
      expect(contact.tags).toEqual(['engineering', 'frontend'])
      expect(contact.createdAt).toBeInstanceOf(Date)
      expect(contact.updatedAt).toBeInstanceOf(Date)
    })

    it('should default optional fields', () => {
      const contact = store.create({ firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com' })
      expect(contact.phone).toBeUndefined()
      expect(contact.company).toBeUndefined()
      expect(contact.role).toBeUndefined()
      expect(contact.tags).toEqual([])
    })
  })

  describe('getAll', () => {
    it('should return all contacts sorted by updatedAt desc', async () => {
      const c1 = store.create({ firstName: 'A', lastName: 'One', email: 'a@test.com' })
      await new Promise((r) => setTimeout(r, 10))
      const c2 = store.create({ firstName: 'B', lastName: 'Two', email: 'b@test.com' })
      const all = store.getAll()
      expect(all).toHaveLength(2)
      expect(all[0].id).toBe(c2.id)
      expect(all[1].id).toBe(c1.id)
    })

    it('should return empty array when no contacts exist', () => {
      expect(store.getAll()).toEqual([])
    })
  })

  describe('getById', () => {
    it('should return a contact by id', () => {
      const created = store.create({ firstName: 'Carol', lastName: 'White', email: 'carol@test.com' })
      const found = store.getById(created.id)
      expect(found).toEqual(created)
    })

    it('should return null for non-existent id', () => {
      expect(store.getById('non-existent')).toBeNull()
    })
  })

  describe('update', () => {
    it('should update partial fields', () => {
      const contact = store.create({ firstName: 'Dave', lastName: 'Brown', email: 'dave@test.com', tags: ['old'] })
      const updated = store.update(contact.id, { firstName: 'David', tags: ['new'] })
      expect(updated.firstName).toBe('David')
      expect(updated.lastName).toBe('Brown')
      expect(updated.tags).toEqual(['new'])
    })

    it('should set new updatedAt', async () => {
      const contact = store.create({ firstName: 'Eve', lastName: 'Green', email: 'eve@test.com' })
      await new Promise((r) => setTimeout(r, 10))
      const updated = store.update(contact.id, { email: 'newemail@test.com' })
      expect(updated.updatedAt.getTime()).toBeGreaterThan(contact.updatedAt.getTime())
    })

    it('should throw for non-existent id', () => {
      expect(() => store.update('missing', { firstName: 'X' })).toThrow('Contact with id "missing" not found')
    })
  })

  describe('delete', () => {
    it('should delete an existing contact and return true', () => {
      const contact = store.create({ firstName: 'Frank', lastName: 'Harris', email: 'frank@test.com' })
      expect(store.delete(contact.id)).toBe(true)
      expect(store.getById(contact.id)).toBeNull()
    })

    it('should return false for non-existent id', () => {
      expect(store.delete('missing')).toBe(false)
    })
  })

  describe('search', () => {
    beforeEach(() => {
      store.create({ firstName: 'Grace', lastName: 'Lee', email: 'grace@techcorp.com', company: 'TechCorp', tags: ['engineering'] })
      store.create({ firstName: 'Henry', lastName: 'Wilson', email: 'henry@design.co', company: 'DesignCo', tags: ['design'] })
      store.create({ firstName: 'Iris', lastName: 'Taylor', email: 'iris@techcorp.com', company: 'TechCorp', tags: ['engineering', 'lead'] })
    })

    it('should search by firstName', () => {
      const results = store.search('grace')
      expect(results).toHaveLength(1)
      expect(results[0].firstName).toBe('Grace')
    })

    it('should search by lastName', () => {
      const results = store.search('taylor')
      expect(results).toHaveLength(1)
      expect(results[0].firstName).toBe('Iris')
    })

    it('should search by email', () => {
      const results = store.search('henry@design.co')
      expect(results).toHaveLength(1)
      expect(results[0].firstName).toBe('Henry')
    })

    it('should search by company', () => {
      const results = store.search('techcorp')
      expect(results).toHaveLength(2)
    })

    it('should be case-insensitive', () => {
      const results = store.search('DESIGN')
      expect(results).toHaveLength(1)
      expect(results[0].firstName).toBe('Henry')
    })

    it('should return empty for no match', () => {
      expect(store.search('nonexistent')).toEqual([])
    })
  })

  describe('filterByTags', () => {
    beforeEach(() => {
      store.create({ firstName: 'Jack', lastName: 'A', email: 'jack@test.com', tags: ['engineering', 'frontend'] })
      store.create({ firstName: 'Kate', lastName: 'B', email: 'kate@test.com', tags: ['design'] })
      store.create({ firstName: 'Leo', lastName: 'C', email: 'leo@test.com', tags: ['engineering', 'backend'] })
    })

    it('should filter by single tag', () => {
      const results = store.filterByTags(['design'])
      expect(results).toHaveLength(1)
      expect(results[0].firstName).toBe('Kate')
    })

    it('should filter by multiple tags (OR logic)', () => {
      const results = store.filterByTags(['design', 'backend'])
      expect(results).toHaveLength(2)
    })

    it('should return all contacts when no tags provided', () => {
      const results = store.filterByTags([])
      expect(results).toHaveLength(3)
    })
  })

  describe('sort', () => {
    beforeEach(() => {
      store.create({ firstName: 'Mia', lastName: 'Zhao', email: 'a@test.com', company: 'Zeta' })
      store.create({ firstName: 'Noah', lastName: 'Yuan', email: 'b@test.com', company: 'Alpha' })
      store.create({ firstName: 'Olivia', lastName: 'Xiu', email: 'c@test.com', company: 'Beta' })
    })

    it('should sort by firstName asc', () => {
      const results = store.sort('firstName', 'asc')
      expect(results[0].firstName).toBe('Mia')
      expect(results[1].firstName).toBe('Noah')
      expect(results[2].firstName).toBe('Olivia')
    })

    it('should sort by firstName desc', () => {
      const results = store.sort('firstName', 'desc')
      expect(results[0].firstName).toBe('Olivia')
      expect(results[1].firstName).toBe('Noah')
      expect(results[2].firstName).toBe('Mia')
    })

    it('should sort by email', () => {
      const results = store.sort('email', 'asc')
      expect(results[0].email).toBe('a@test.com')
    })

    it('should sort by company', () => {
      const results = store.sort('company', 'asc')
      expect(results[0].company).toBe('Alpha')
    })

    it('should sort by createdAt', async () => {
      store.create({ firstName: 'Mia', lastName: 'Zhao', email: 'a@test.com', company: 'Zeta' })
      await new Promise((r) => setTimeout(r, 10))
      store.create({ firstName: 'Noah', lastName: 'Yuan', email: 'b@test.com', company: 'Alpha' })
      await new Promise((r) => setTimeout(r, 10))
      store.create({ firstName: 'Olivia', lastName: 'Xiu', email: 'c@test.com', company: 'Beta' })
      const results = store.sort('createdAt', 'desc')
      expect(results[0].firstName).toBe('Olivia')
      expect(results[1].firstName).toBe('Noah')
      expect(results[2].firstName).toBe('Mia')
    })
  })

  describe('paginate', () => {
    beforeEach(() => {
      for (let i = 1; i <= 15; i++) {
        store.create({ firstName: `User${i}`, lastName: 'Test', email: `user${i}@test.com` })
      }
    })

    it('should return correct page of results', () => {
      const page = store.paginate(0, 5)
      expect(page.items).toHaveLength(5)
      expect(page.total).toBe(15)
      expect(page.page).toBe(1)
      expect(page.totalPages).toBe(3)
    })

    it('should return correct second page', () => {
      const page = store.paginate(5, 5)
      expect(page.items).toHaveLength(5)
      expect(page.total).toBe(15)
      expect(page.page).toBe(2)
    })

    it('should return last page with remainder', () => {
      const page = store.paginate(10, 5)
      expect(page.items).toHaveLength(5)
      expect(page.total).toBe(15)
      expect(page.page).toBe(3)
    })

    it('should handle page beyond available data', () => {
      const page = store.paginate(100, 5)
      expect(page.items).toHaveLength(0)
      expect(page.total).toBe(15)
    })
  })

  describe('query (combined)', () => {
    beforeEach(() => {
      store.create({ firstName: 'Alice', lastName: 'Smith', email: 'alice@acme.com', company: 'Acme', tags: ['engineering'] })
      store.create({ firstName: 'Bob', lastName: 'Brown', email: 'bob@acme.com', company: 'Acme', tags: ['design'] })
      store.create({ firstName: 'Carol', lastName: 'Jones', email: 'carol@beta.com', company: 'Beta', tags: ['engineering'] })
      store.create({ firstName: 'Dave', lastName: 'Miller', email: 'dave@beta.com', company: 'Beta', tags: ['marketing'] })
    })

    it('should combine search and filterByTags', () => {
      const results = store.query({ search: 'acme', filterTags: ['engineering'] })
      expect(results.items).toHaveLength(1)
      expect(results.items[0].firstName).toBe('Alice')
    })

    it('should combine search with pagination', () => {
      for (let i = 0; i < 10; i++) {
        store.create({ firstName: `X${i}`, lastName: 'Test', email: `xtest${i}@test.com`, company: 'TestCo' })
      }
      const results = store.query({ search: 'xtest', pagination: { offset: 0, limit: 3 } })
      expect(results.items).toHaveLength(3)
      expect(results.total).toBe(10)
    })

    it('should combine sort with filterByTags', () => {
      const results = store.query({ filterTags: ['engineering'], sort: { field: 'firstName', order: 'asc' } })
      expect(results.items).toHaveLength(2)
      expect(results.items[0].firstName).toBe('Alice')
      expect(results.items[1].firstName).toBe('Carol')
    })

    it('should combine all operations', () => {
      const results = store.query({
        search: 'acme',
        filterTags: ['engineering'],
        sort: { field: 'firstName', order: 'asc' },
        pagination: { offset: 0, limit: 10 },
      })
      expect(results.items).toHaveLength(1)
      expect(results.total).toBe(1)
    })
  })
})
