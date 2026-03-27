import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ContactTable } from './ContactTable'
import type { Contact } from '../../collections/contacts'

const makeContact = (overrides: Partial<Contact> = {}): Contact => ({
  id: '1',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@test.com',
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe('ContactTable', () => {
  const contacts: Contact[] = [
    makeContact({ id: '1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', company: 'Acme', role: 'Engineer', tags: ['engineering'] }),
    makeContact({ id: '2', firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com', company: 'Beta', role: 'Designer', tags: ['design'] }),
    makeContact({ id: '3', firstName: 'Carol', lastName: 'White', email: 'carol@test.com', company: 'Acme', role: 'Manager', tags: ['product'] }),
  ]

  it('should render all contact rows', () => {
    render(<ContactTable contacts={contacts} onRowClick={vi.fn()} />)
    const firstNames = ['Alice', 'Bob', 'Carol']
    const lastNames = ['Smith', 'Jones', 'White']
    firstNames.forEach((fn) => expect(screen.getByText(fn)).toBeDefined())
    lastNames.forEach((ln) => expect(screen.getByText(ln)).toBeDefined())
  })

  it('should render email and company columns', () => {
    render(<ContactTable contacts={contacts} onRowClick={vi.fn()} />)
    expect(screen.getByText('alice@test.com')).toBeDefined()
    expect(screen.getAllByText('Acme')).toHaveLength(2)
  })

  it('should render tag badges', () => {
    render(<ContactTable contacts={contacts} onRowClick={vi.fn()} />)
    expect(screen.getAllByText('engineering')).toHaveLength(1)
    expect(screen.getAllByText('design')).toHaveLength(1)
  })

  it('should call onRowClick with contact id when row is clicked', () => {
    const onRowClick = vi.fn()
    render(<ContactTable contacts={contacts} onRowClick={onRowClick} />)
    fireEvent.click(screen.getByText('Alice'))
    expect(onRowClick).toHaveBeenCalledWith('1')
  })

  it('should render sort indicators for active sort field', () => {
    const { container } = render(
      <ContactTable contacts={contacts} sortField="firstName" sortOrder="asc" onSort={vi.fn()} onRowClick={vi.fn()} />,
    )
    expect(container.innerHTML).toContain('asc')
  })

  it('should call onSort when column header is clicked', () => {
    const onSort = vi.fn()
    render(<ContactTable contacts={contacts} onSort={onSort} onRowClick={vi.fn()} />)
    // Find and click the First Name header
    const headers = screen.getAllByRole('columnheader')
    const firstNameHeader = headers.find((h) => h.textContent?.includes('First Name'))
    if (firstNameHeader) fireEvent.click(firstNameHeader)
    expect(onSort).toHaveBeenCalled()
  })

  it('should render empty state when no contacts', () => {
    const { container } = render(<ContactTable contacts={[]} onRowClick={vi.fn()} />)
    expect(container.textContent).toContain('No contacts found')
  })
})
