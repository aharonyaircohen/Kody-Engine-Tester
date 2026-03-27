'use client'

import { ContactAvatar } from './ContactAvatar'
import type { Contact, SortField, SortOrder } from '../../collections/contacts'
import styles from './ContactTable.module.css'

interface ContactTableProps {
  contacts: Contact[]
  onRowClick: (id: string) => void
  sortField?: SortField
  sortOrder?: SortOrder
  onSort?: (field: SortField) => void
}

export function ContactTable({ contacts, onRowClick, sortField, sortOrder, onSort }: ContactTableProps) {
  function handleSort(field: SortField) {
    if (onSort) onSort(field)
  }

  function sortIndicator(field: SortField) {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  if (contacts.length === 0) {
    return <div className={styles.empty}>No contacts found</div>
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table} role="grid">
        <thead>
          <tr>
            <th scope="col" className={styles.th}>Avatar</th>
            <th
              scope="col"
              className={`${styles.th} ${styles.sortable}`}
              onClick={() => handleSort('firstName')}
              role="columnheader"
              aria-sort={sortField === 'firstName' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              First Name {sortIndicator('firstName')}
            </th>
            <th
              scope="col"
              className={`${styles.th} ${styles.sortable}`}
              onClick={() => handleSort('lastName')}
              role="columnheader"
              aria-sort={sortField === 'lastName' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              Last Name {sortIndicator('lastName')}
            </th>
            <th
              scope="col"
              className={`${styles.th} ${styles.sortable}`}
              onClick={() => handleSort('email')}
              role="columnheader"
              aria-sort={sortField === 'email' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              Email {sortIndicator('email')}
            </th>
            <th
              scope="col"
              className={`${styles.th} ${styles.sortable}`}
              onClick={() => handleSort('company')}
              role="columnheader"
              aria-sort={sortField === 'company' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              Company {sortIndicator('company')}
            </th>
            <th scope="col" className={styles.th}>Role</th>
            <th scope="col" className={styles.th}>Tags</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr
              key={contact.id}
              className={styles.row}
              onClick={() => onRowClick(contact.id)}
              role="row"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onRowClick(contact.id)}
            >
              <td className={styles.td}>
                <ContactAvatar firstName={contact.firstName} lastName={contact.lastName} size={36} />
              </td>
              <td className={styles.td}>{contact.firstName}</td>
              <td className={styles.td}>{contact.lastName}</td>
              <td className={styles.td}>{contact.email}</td>
              <td className={styles.td}>{contact.company ?? '—'}</td>
              <td className={styles.td}>{contact.role ?? '—'}</td>
              <td className={styles.td}>
                <div className={styles.tags}>
                  {contact.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
