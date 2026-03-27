export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  role?: string
  tags: string[]
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateContactInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  role?: string
  tags?: string[]
  avatar?: string
}

export type UpdateContactInput = Partial<{
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  role?: string
  tags: string[]
  avatar?: string
}>

export type SortField = 'firstName' | 'lastName' | 'email' | 'company' | 'createdAt' | 'updatedAt'
export type SortOrder = 'asc' | 'desc'

export interface PaginationOptions {
  offset: number
  limit: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface QueryOptions {
  search?: string
  filterTags?: string[]
  sort?: { field: SortField; order: SortOrder }
  pagination?: PaginationOptions
}

const SEED_CONTACTS: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // TechCorp (5 contacts)
  { firstName: 'Alice', lastName: 'Chen', email: 'alice.chen@techcorp.io', phone: '+1-555-0101', company: 'TechCorp', role: 'Senior Engineer', tags: ['engineering', 'frontend'] },
  { firstName: 'Bob', lastName: 'Martinez', email: 'bob.martinez@techcorp.io', phone: '+1-555-0102', company: 'TechCorp', role: 'Product Manager', tags: ['product', 'lead'] },
  { firstName: 'Carol', lastName: 'Patel', email: 'carol.patel@techcorp.io', phone: '+1-555-0103', company: 'TechCorp', role: 'UX Designer', tags: ['design', 'ux'] },
  { firstName: 'David', lastName: 'Kim', email: 'david.kim@techcorp.io', company: 'TechCorp', role: 'Backend Engineer', tags: ['engineering', 'backend', 'python'] },
  { firstName: 'Elena', lastName: 'Rogers', email: 'elena.rogers@techcorp.io', phone: '+1-555-0105', company: 'TechCorp', role: 'QA Lead', tags: ['qa', 'lead'] },
  // BrightWave (4 contacts)
  { firstName: 'Frank', lastName: 'Nguyen', email: 'frank.nguyen@brightwave.com', phone: '+1-555-0201', company: 'BrightWave', role: 'CEO', tags: ['executive'] },
  { firstName: 'Grace', lastName: 'Okafor', email: 'grace.okafor@brightwave.com', phone: '+1-555-0202', company: 'BrightWave', role: 'CTO', tags: ['executive', 'engineering'] },
  { firstName: 'Henry', lastName: 'Schmidt', email: 'henry.schmidt@brightwave.com', company: 'BrightWave', role: 'DevOps Engineer', tags: ['devops', 'infrastructure'] },
  { firstName: 'Iris', lastName: 'Thompson', email: 'iris.thompson@brightwave.com', phone: '+1-555-0204', company: 'BrightWave', role: 'Data Analyst', tags: ['data', 'analytics'] },
  // NovaTech (4 contacts)
  { firstName: 'Jack', lastName: 'Ali', email: 'jack.ali@novatech.dev', phone: '+1-555-0301', company: 'NovaTech', role: 'Mobile Developer', tags: ['mobile', 'ios', 'android'] },
  { firstName: 'Kate', lastName: 'Bennett', email: 'kate.bennett@novatech.dev', company: 'NovaTech', role: 'Frontend Engineer', tags: ['engineering', 'frontend', 'react'] },
  { firstName: 'Leo', lastName: 'Chang', email: 'leo.chang@novatech.dev', phone: '+1-555-0303', company: 'NovaTech', role: 'ML Engineer', tags: ['ml', 'ai', 'engineering'] },
  { firstName: 'Mia', lastName: 'Davis', email: 'mia.davis@novatech.dev', phone: '+1-555-0304', company: 'NovaTech', role: 'Marketing Lead', tags: ['marketing'] },
  // CloudBase (4 contacts)
  { firstName: 'Noah', lastName: 'Edwards', email: 'noah.edwards@cloudbase.io', phone: '+1-555-0401', company: 'CloudBase', role: 'Solutions Architect', tags: ['cloud', 'architecture'] },
  { firstName: 'Olivia', lastName: 'Fernandez', email: 'olivia.fernandez@cloudbase.io', company: 'CloudBase', role: 'Security Engineer', tags: ['security', 'engineering'] },
  { firstName: 'Paul', lastName: 'Gupta', email: 'paul.gupta@cloudbase.io', phone: '+1-555-0403', company: 'CloudBase', role: 'Customer Success', tags: ['customer-success'] },
  { firstName: 'Quinn', lastName: 'Harris', email: 'quinn.harris@cloudbase.io', phone: '+1-555-0404', company: 'CloudBase', role: 'Sales Engineer', tags: ['sales', 'pre-sales'] },
  // DataFlow (3 contacts)
  { firstName: 'Rachel', lastName: 'Ivanova', email: 'rachel.ivanova@dataflow.ai', phone: '+1-555-0501', company: 'DataFlow', role: 'Data Scientist', tags: ['data', 'science', 'ml'] },
  { firstName: 'Sam', lastName: 'Jackson', email: 'sam.jackson@dataflow.ai', company: 'DataFlow', role: 'Backend Engineer', tags: ['engineering', 'backend'] },
  { firstName: 'Tina', lastName: 'Kowalski', email: 'tina.kowalski@dataflow.ai', phone: '+1-555-0503', company: 'DataFlow', role: 'Researcher', tags: ['research', 'ai'] },
]

export class ContactStore {
  private contacts: Map<string, Contact> = new Map()

  constructor(seed = true) {
    if (seed) {
      for (const data of SEED_CONTACTS) {
        const now = new Date()
        const id = crypto.randomUUID()
        this.contacts.set(id, { ...data, id, createdAt: now, updatedAt: now })
      }
    }
  }

  getAll(): Contact[] {
    return Array.from(this.contacts.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    )
  }

  getById(id: string): Contact | null {
    return this.contacts.get(id) ?? null
  }

  create(input: CreateContactInput): Contact {
    const now = new Date()
    const contact: Contact = {
      id: crypto.randomUUID(),
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      company: input.company,
      role: input.role,
      tags: input.tags ?? [],
      avatar: input.avatar,
      createdAt: now,
      updatedAt: now,
    }
    this.contacts.set(contact.id, contact)
    return contact
  }

  update(id: string, input: UpdateContactInput): Contact {
    const contact = this.contacts.get(id)
    if (!contact) {
      throw new Error(`Contact with id "${id}" not found`)
    }
    const updated: Contact = {
      ...contact,
      ...input,
      updatedAt: new Date(),
    }
    this.contacts.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.contacts.delete(id)
  }

  search(query: string): Contact[] {
    const lower = query.toLowerCase()
    return this.getAll().filter(
      (contact) =>
        contact.firstName.toLowerCase().includes(lower) ||
        contact.lastName.toLowerCase().includes(lower) ||
        contact.email.toLowerCase().includes(lower) ||
        (contact.company?.toLowerCase().includes(lower) ?? false),
    )
  }

  filterByTags(tags: string[]): Contact[] {
    if (tags.length === 0) return this.getAll()
    return this.getAll().filter((contact) =>
      tags.some((tag) => contact.tags.includes(tag)),
    )
  }

  sort(field: SortField, order: SortOrder): Contact[] {
    const dir = order === 'asc' ? 1 : -1
    return [...this.getAll()].sort((a, b) => {
      const aVal = a[field] ?? ''
      const bVal = b[field] ?? ''
      if (aVal < bVal) return -1 * dir
      if (aVal > bVal) return 1 * dir
      return 0
    })
  }

  paginate(offset: number, limit: number): PaginatedResult<Contact> {
    const all = this.getAll()
    const total = all.length
    const page = Math.floor(offset / limit) + 1
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const items = all.slice(offset, offset + limit)
    return {
      items,
      total,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
  }

  query(options: QueryOptions): PaginatedResult<Contact> {
    let results = this.getAll()

    if (options.search && options.search.trim()) {
      const lower = options.search.toLowerCase()
      results = results.filter(
        (c) =>
          c.firstName.toLowerCase().includes(lower) ||
          c.lastName.toLowerCase().includes(lower) ||
          c.email.toLowerCase().includes(lower) ||
          (c.company?.toLowerCase().includes(lower) ?? false),
      )
    }

    if (options.filterTags && options.filterTags.length > 0) {
      results = results.filter((c) =>
        options.filterTags!.some((tag) => c.tags.includes(tag)),
      )
    }

    if (options.sort) {
      const { field, order } = options.sort
      const dir = order === 'asc' ? 1 : -1
      results = [...results].sort((a, b) => {
        const aVal = a[field] ?? ''
        const bVal = b[field] ?? ''
        if (aVal < bVal) return -1 * dir
        if (aVal > bVal) return 1 * dir
        return 0
      })
    }

    const total = results.length
    const offset = options.pagination?.offset ?? 0
    const limit = options.pagination?.limit ?? 10
    const page = Math.floor(offset / limit) + 1
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const items = results.slice(offset, offset + limit)

    return {
      items,
      total,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
  }
}

export const contactsStore = new ContactStore(true)
