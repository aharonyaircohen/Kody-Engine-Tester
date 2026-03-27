'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { contactsStore } from '../../../collections/contacts'
import type { CreateContactInput } from '../../../collections/contacts'
import styles from './form.module.css'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function ContactFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const isEditMode = Boolean(editId)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEditMode && editId) {
      const contact = contactsStore.getById(editId)
      if (contact) {
        setFirstName(contact.firstName)
        setLastName(contact.lastName)
        setEmail(contact.email)
        setPhone(contact.phone ?? '')
        setCompany(contact.company ?? '')
        setRole(contact.role ?? '')
        setTagsInput(contact.tags.join(', '))
      }
    }
  }, [editId, isEditMode])

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!firstName.trim()) newErrors.firstName = 'First name is required'
    if (!lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const input: CreateContactInput = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        role: role.trim() || undefined,
        tags,
      }

      if (isEditMode && editId) {
        contactsStore.update(editId, input)
        router.push(`/contacts/detail?id=${editId}`)
      } else {
        const created = contactsStore.create(input)
        router.push(`/contacts/detail?id=${created.id}`)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.back}>
        <Link href={isEditMode ? `/contacts/detail?id=${editId}` : '/contacts/list'}>
          ← {isEditMode ? 'Back to Contact' : 'Back to Contacts'}
        </Link>
      </div>

      <div className={styles.card}>
        <h1>{isEditMode ? 'Edit Contact' : 'New Contact'}</h1>

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={errors.firstName ? styles.inputError : ''}
              />
              {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
            </div>
            <div className={styles.field}>
              <label htmlFor="lastName">Last Name *</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={errors.lastName ? styles.inputError : ''}
              />
              {errors.lastName && <span className={styles.error}>{errors.lastName}</span>}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? styles.inputError : ''}
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="phone">Phone</label>
              <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label htmlFor="company">Company</label>
              <input id="company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="role">Role</label>
            <input id="role" type="text" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="engineering, frontend, product (comma-separated)"
            />
          </div>

          <div className={styles.actions}>
            <Link href={isEditMode ? `/contacts/detail?id=${editId}` : '/contacts/list'} className={styles.cancelBtn}>
              Cancel
            </Link>
            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
