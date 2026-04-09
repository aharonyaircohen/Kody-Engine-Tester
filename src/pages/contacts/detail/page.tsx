'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { contactsStore } from '../../../collections/contacts'
import { ContactAvatar } from '../../../components/contacts/ContactAvatar'
import styles from './detail.module.css'

export default function ContactDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()!
  const id = searchParams.get('id')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const contact = id ? contactsStore.getById(id) : null

  function handleDelete() {
    if (!id) return
    contactsStore.delete(id)
    router.push('/contacts/list')
  }

  if (!contact) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h2>Contact not found</h2>
          <Link href="/contacts/list">Back to contacts</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.back}>
        <Link href="/contacts/list">← Back to Contacts</Link>
      </div>

      <div className={styles.card}>
        <div className={styles.profile}>
          <ContactAvatar firstName={contact.firstName} lastName={contact.lastName} size={80} />
          <div className={styles.profileInfo}>
            <h1>{contact.firstName} {contact.lastName}</h1>
            {contact.role && <p className={styles.role}>{contact.role}</p>}
            {contact.company && <p className={styles.company}>{contact.company}</p>}
          </div>
        </div>

        <div className={styles.actions}>
          <Link href={`/contacts/form?id=${contact.id}`} className={styles.editBtn}>
            Edit Contact
          </Link>
          <button className={styles.deleteBtn} onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </button>
        </div>

        {showDeleteConfirm && (
          <div className={styles.confirmDialog}>
            <p>Are you sure you want to delete this contact?</p>
            <div className={styles.confirmBtns}>
              <button className={styles.deleteBtn} onClick={handleDelete}>Yes, delete</button>
              <button className={styles.cancelBtn} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className={styles.details}>
          <div className={styles.field}>
            <label>Email</label>
            <span>{contact.email}</span>
          </div>
          {contact.phone && (
            <div className={styles.field}>
              <label>Phone</label>
              <span>{contact.phone}</span>
            </div>
          )}
          {contact.tags.length > 0 && (
            <div className={styles.field}>
              <label>Tags</label>
              <div className={styles.tags}>
                {contact.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
          )}
          <div className={styles.field}>
            <label>Created</label>
            <span>{contact.createdAt.toLocaleDateString()}</span>
          </div>
          <div className={styles.field}>
            <label>Last Updated</label>
            <span>{contact.updatedAt.toLocaleDateString()}</span>
          </div>
        </div>

        <div className={styles.timeline}>
          <h3>Activity Timeline</h3>
          <div className={styles.placeholder}>
            <p>No activity recorded yet.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
