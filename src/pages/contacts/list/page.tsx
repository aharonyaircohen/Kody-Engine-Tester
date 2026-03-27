'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { contactsStore } from '../../../collections/contacts'
import { SearchBar } from '../../../components/contacts/SearchBar'
import { TagFilter } from '../../../components/contacts/TagFilter'
import { ContactTable } from '../../../components/contacts/ContactTable'
import { Pagination } from '../../../components/contacts/Pagination'
import type { SortField, SortOrder } from '../../../collections/contacts'
import styles from './list.module.css'

const PAGE_SIZE = 10

export default function ContactListPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>('firstName')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    contactsStore.getAll().forEach((c) => c.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [])

  const { items, total, totalPages } = useMemo(() => {
    return contactsStore.query({
      search: debouncedSearch,
      filterTags: selectedTags,
      sort: { field: sortField, order: sortOrder },
      pagination: { offset: (currentPage - 1) * PAGE_SIZE, limit: PAGE_SIZE },
    })
  }, [debouncedSearch, selectedTags, sortField, sortOrder, currentPage])

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    // Debounce: update debounced search after 300ms
    setTimeout(() => setDebouncedSearch(value), 300)
  }

  function handleRowClick(id: string) {
    router.push(`/contacts/detail?id=${id}`)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Contacts</h1>
        <Link href="/contacts/form" className={styles.addBtn}>
          + Add Contact
        </Link>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchRow}>
          <SearchBar value={search} onChange={handleSearchChange} />
        </div>
        <TagFilter
          availableTags={allTags}
          selectedTags={selectedTags}
          onChange={(tags) => {
            setSelectedTags(tags)
            setCurrentPage(1)
          }}
        />
      </div>

      <ContactTable
        contacts={items}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        onRowClick={handleRowClick}
      />

      <div className={styles.paginationRow}>
        <span className={styles.count}>
          {total} contact{total !== 1 ? 's' : ''}
        </span>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>
    </div>
  )
}
