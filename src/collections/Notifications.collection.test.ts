import { describe, it, expect } from 'vitest'
import { Notifications } from './Notifications'

describe('Notifications collection config', () => {
  it('should have slug "notifications"', () => {
    expect(Notifications.slug).toBe('notifications')
  })

  it('should have required fields: recipient, type, title, message, isRead, link', () => {
    const fieldNames = Notifications.fields.map((f: any) => f.name)
    expect(fieldNames).toContain('recipient')
    expect(fieldNames).toContain('type')
    expect(fieldNames).toContain('title')
    expect(fieldNames).toContain('message')
    expect(fieldNames).toContain('isRead')
    expect(fieldNames).toContain('link')
  })

  it('should have access controls defined', () => {
    expect(Notifications.access).toBeDefined()
    expect(Notifications.access!.read).toBeDefined()
    expect(Notifications.access!.create).toBeDefined()
  })

  it('should define notification type as select with LMS event options', () => {
    const typeField = Notifications.fields.find((f: any) => f.name === 'type') as any
    expect(typeField.type).toBe('select')
    const values = typeField.options.map((o: any) => o.value ?? o)
    expect(values).toContain('enrollment')
    expect(values).toContain('grade')
    expect(values).toContain('deadline')
    expect(values).toContain('discussion')
    expect(values).toContain('announcement')
  })

  it('should default isRead to false', () => {
    const isReadField = Notifications.fields.find((f: any) => f.name === 'isRead') as any
    expect(isReadField.defaultValue).toBe(false)
  })

  it('should have recipient as relationship to users', () => {
    const recipientField = Notifications.fields.find((f: any) => f.name === 'recipient') as any
    expect(recipientField.type).toBe('relationship')
    expect(recipientField.relationTo).toBe('users')
    expect(recipientField.required).toBe(true)
  })

  it('should have link as optional text field', () => {
    const linkField = Notifications.fields.find((f: any) => f.name === 'link') as any
    expect(linkField.type).toBe('text')
    expect(linkField.required).toBeFalsy()
  })
})
