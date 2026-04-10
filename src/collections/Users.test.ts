import { describe, it, expect } from 'vitest'
import type { AccessArgs, Field } from 'payload'

import { Users } from './Users'

// Helper to find a named field from the collection
function findField(name: string): Field | undefined {
  return Users.fields.find((f) => 'name' in f && f.name === name) as Field | undefined
}

// Helper to build a mock request
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

// --- Collection Config Structure ---

describe('Users collection config', () => {
  it('should export a Users collection config', () => {
    expect(Users).toBeDefined()
    expect(typeof Users).toBe('object')
  })

  it('should have slug set to "users"', () => {
    expect(Users.slug).toBe('users')
  })

  it('should have auth enabled', () => {
    expect(Users.auth).toBe(true)
  })

  it('should have access control defined', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const access = Users.access as any
    expect(access).toBeDefined()
    expect(typeof access.read).toBe('function')
    expect(typeof access.create).toBe('function')
    expect(typeof access.update).toBe('function')
    expect(typeof access.delete).toBe('function')
  })
})

// --- Field Definitions ---

describe('Users fields - firstName', () => {
  it('should have a firstName text field that is required', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('firstName') as any
    expect(field).toBeDefined()
    expect(field.type).toBe('text')
    expect(field.required).toBe(true)
  })
})

describe('Users fields - lastName', () => {
  it('should have a lastName text field that is required', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('lastName') as any
    expect(field).toBeDefined()
    expect(field.type).toBe('text')
    expect(field.required).toBe(true)
  })
})

describe('Users fields - displayName', () => {
  it('should have a displayName text field that is read-only in admin', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('displayName') as any
    expect(field).toBeDefined()
    expect(field.type).toBe('text')
    expect(field.admin?.readOnly).toBe(true)
  })

  it('should have a beforeChange hook on displayName', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('displayName') as any
    expect(Array.isArray(field.hooks?.beforeChange)).toBe(true)
    expect(field.hooks.beforeChange.length).toBeGreaterThan(0)
  })

  it('should auto-compute displayName from firstName and lastName', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('displayName') as any
    const hook = field.hooks.beforeChange[0]
    const result = hook({ data: { firstName: 'Jane', lastName: 'Doe' } })
    expect(result).toBe('Jane Doe')
  })

  it('should return only firstName if lastName is empty', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('displayName') as any
    const hook = field.hooks.beforeChange[0]
    const result = hook({ data: { firstName: 'Jane', lastName: '' } })
    expect(result).toBe('Jane')
  })

  it('should return existing displayName if both names are empty', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('displayName') as any
    const hook = field.hooks.beforeChange[0]
    const result = hook({ data: { firstName: '', lastName: '', displayName: 'Existing' } })
    expect(result).toBe('Existing')
  })
})

describe('Users fields - avatar', () => {
  it('should have an avatar relationship field to media, optional', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('avatar') as any
    expect(field).toBeDefined()
    expect(field.type).toBe('relationship')
    expect(field.relationTo).toBe('media')
    expect(field.required).toBeFalsy()
  })
})

describe('Users fields - bio', () => {
  it('should have a bio textarea field that is optional', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('bio') as any
    expect(field).toBeDefined()
    expect(field.type).toBe('textarea')
    expect(field.required).toBeFalsy()
  })

  it('should pass validation when bio is under 500 chars', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('bio') as any
    const result = field.validate('Hello world')
    expect(result).toBe(true)
  })

  it('should fail validation when bio exceeds 500 chars', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('bio') as any
    const longBio = 'a'.repeat(501)
    const result = field.validate(longBio)
    expect(typeof result).toBe('string')
    expect(result).toContain('500')
  })

  it('should pass validation when bio is null or undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('bio') as any
    expect(field.validate(null)).toBe(true)
    expect(field.validate(undefined)).toBe(true)
  })
})

describe('Users fields - role', () => {
  it('should have a role select field with admin/editor/viewer options', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('role') as any
    expect(field).toBeDefined()
    expect(field.type).toBe('select')
    expect(field.options).toEqual(['admin', 'editor', 'viewer'])
  })

  it('should default role to "viewer"', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('role') as any
    expect(field.defaultValue).toBe('viewer')
  })

  it('should be required', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('role') as any
    expect(field.required).toBe(true)
  })

  it('should have field-level update access defined', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('role') as any
    expect(typeof field.access?.update).toBe('function')
  })

  it('should allow admin to update role', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('role') as any
    const req = makeMockReq({ user: { id: 'admin1', collection: 'users', role: 'admin' } })
    const result = field.access.update({ req })
    expect(result).toBe(true)
  })

  it('should deny viewer from updating role', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('role') as any
    const req = makeMockReq({ user: { id: 'u1', collection: 'users', role: 'viewer' } })
    const result = field.access.update({ req })
    expect(result).toBe(false)
  })

  it('should deny editor from updating role', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('role') as any
    const req = makeMockReq({ user: { id: 'u2', collection: 'users', role: 'editor' } })
    const result = field.access.update({ req })
    expect(result).toBe(false)
  })

  it('should deny update role when no user is present', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('role') as any
    const req = makeMockReq({ user: null })
    const result = field.access.update({ req })
    expect(result).toBe(false)
  })
})

describe('Users fields - organization', () => {
  it('should have an organization text field that is optional', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('organization') as any
    expect(field).toBeDefined()
    expect(field.type).toBe('text')
    expect(field.required).toBeFalsy()
  })
})

// --- Collection-level Access Control ---

describe('Users access control - read', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canRead = (Users.access as any)?.read

  it('should deny read when no user is logged in', () => {
    const req = makeMockReq({ user: null })
    const result = canRead({ req } as AccessArgs)
    expect(result).toBe(false)
  })

  it('should allow read for any authenticated user', () => {
    const req = makeMockReq({ user: { id: 'u1', collection: 'users', role: 'student' } })
    const result = canRead({ req } as AccessArgs)
    expect(result).toBe(true)
  })
})

describe('Users access control - create', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canCreate = (Users.access as any)?.create

  it('should allow create (public registration)', () => {
    const req = makeMockReq({ user: null })
    const result = canCreate({ req } as AccessArgs)
    expect(result).toBe(true)
  })
})

describe('Users access control - update', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canUpdate = (Users.access as any)?.update

  it('should deny update when no user is logged in', () => {
    const req = makeMockReq({ user: null })
    const result = canUpdate({ req, id: 'u1' } as AccessArgs & { id: string })
    expect(result).toBe(false)
  })

  it('should allow user to update their own profile', () => {
    const req = makeMockReq({ user: { id: 'u1', collection: 'users', role: 'student' } })
    const result = canUpdate({ req, id: 'u1' } as AccessArgs & { id: string })
    expect(result).toBe(true)
  })

  it('should deny user from updating another user profile', () => {
    const req = makeMockReq({ user: { id: 'u1', collection: 'users', role: 'student' } })
    const result = canUpdate({ req, id: 'u2' } as AccessArgs & { id: string })
    expect(result).toBe(false)
  })

  it('should allow admin to update any profile', () => {
    const req = makeMockReq({ user: { id: 'admin1', collection: 'users', role: 'admin' } })
    const result = canUpdate({ req, id: 'u99' } as AccessArgs & { id: string })
    expect(result).toBe(true)
  })
})

describe('Users fields - passwordHash', () => {
  it('should have a passwordHash text field', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('passwordHash') as any
    expect(field).toBeDefined()
    expect(field.type).toBe('text')
  })

  it('should have passwordHash that is optional', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('passwordHash') as any
    expect(field.required).toBeFalsy()
  })

  it('should have passwordHash hidden from API responses', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('passwordHash') as any
    expect(field.hidden).toBe(true)
  })

  it('should deny read access to passwordHash', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('passwordHash') as any
    const req = makeMockReq({ user: { id: 'u1', collection: 'users', role: 'admin' } })
    const result = field.access.read({ req } as AccessArgs)
    expect(result).toBe(false)
  })

  it('should allow create access to passwordHash', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('passwordHash') as any
    const req = makeMockReq({ user: null })
    const result = field.access.create({ req } as AccessArgs)
    expect(result).toBe(true)
  })

  it('should deny update access to passwordHash', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const field = findField('passwordHash') as any
    const req = makeMockReq({ user: { id: 'u1', collection: 'users', role: 'admin' } })
    const result = field.access.update({ req } as AccessArgs)
    expect(result).toBe(false)
  })
})

describe('Users fields - email (auth provided)', () => {
  it('should have email field provided by auth: true', () => {
    // Email is added by Payload automatically when auth: true is set
    // The field is not in our custom fields array, but auth: true confirms its existence
    expect(Users.auth).toBe(true)
  })

  it('should have email as useAsTitle in admin', () => {
    // The email field is used as title in admin UI
    expect(Users.admin?.useAsTitle).toBe('email')
  })
})

describe('Users access control - delete', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canDelete = (Users.access as any)?.delete

  it('should deny delete when no user is logged in', () => {
    const req = makeMockReq({ user: null })
    const result = canDelete({ req } as AccessArgs)
    expect(result).toBe(false)
  })

  it('should deny delete for non-admin users', () => {
    const req = makeMockReq({ user: { id: 'u1', collection: 'users', role: 'student' } })
    const result = canDelete({ req } as AccessArgs)
    expect(result).toBe(false)
  })

  it('should allow admin to delete users', () => {
    const req = makeMockReq({ user: { id: 'admin1', collection: 'users', role: 'admin' } })
    const result = canDelete({ req } as AccessArgs)
    expect(result).toBe(true)
  })
})
