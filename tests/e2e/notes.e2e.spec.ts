import { test, expect } from '@playwright/test'
import { getPayload } from 'payload'
import type { CollectionSlug } from 'payload'
import config from '../../src/payload.config.js'

const BASE_URL = 'http://localhost:3000'

async function seedNote(data: { title: string; content: string; tags?: string[] }) {
  const payload = await getPayload({ config })
  return payload.create({
    collection: 'notes' as CollectionSlug,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { title: data.title, content: data.content, tags: data.tags ?? [] } as any,
  })
}

async function cleanupNotes() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'notes' as CollectionSlug, limit: 1000 })
  await Promise.all(
    docs.map((doc) => payload.delete({ collection: 'notes' as CollectionSlug, id: doc.id })),
  )
}

test.describe('Notes', () => {
  test.beforeAll(async () => {
    await cleanupNotes()
  })

  test.afterAll(async () => {
    await cleanupNotes()
  })

  test('notes list page shows heading, New Note link, search bar and empty state', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/notes`)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1').first()).toHaveText('Notes')
    await expect(page.locator(`a[href="/notes/create"]`)).toBeVisible()
    await expect(page.locator(`a[href="/notes/create"]`)).toHaveText('New Note')
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible()
    await expect(
      page.locator('text=No notes yet. Create your first note!'),
    ).toBeVisible()
  })

  test('notes create page renders form with required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/notes/create`)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1').first()).toHaveText('Create Note')
    await expect(page.locator('label:has-text("Title")')).toBeVisible()
    await expect(page.locator('label:has-text("Content")')).toBeVisible()
    await expect(page.locator('label:has-text("Tags")')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toHaveText('Create Note')
  })

  test('notes create form shows validation errors when submitted empty', async ({ page }) => {
    await page.goto(`${BASE_URL}/notes/create`)
    await page.waitForLoadState('networkidle')

    await page.locator('button[type="submit"]').click()

    // Client-side validation should show at least one "This field is required" error
    await expect(page.locator('text=This field is required').first()).toBeVisible()
    // URL should stay on create page (no redirect)
    await expect(page).toHaveURL(`${BASE_URL}/notes/create`)
  })

  test('notes create page back link navigates to notes list', async ({ page }) => {
    await page.goto(`${BASE_URL}/notes/create`)
    await page.waitForLoadState('networkidle')

    await page.locator(`a[href="/notes"]`).click()
    await expect(page).toHaveURL(`${BASE_URL}/notes`)
    await expect(page.locator('h1').first()).toHaveText('Notes')
  })

  test.describe('with seeded notes', () => {
    test.beforeAll(async () => {
      await seedNote({ title: 'First Note', content: 'Content of the first note', tags: ['intro'] })
      await seedNote({
        title: 'Second Note',
        content: 'Content of the second note',
        tags: ['follow-up'],
      })
      await seedNote({
        title: 'Searchable Unique XYZ',
        content: 'Specific content used only for the search test',
        tags: ['search'],
      })
    })

    test('notes list shows all seeded notes', async ({ page }) => {
      await page.goto(`${BASE_URL}/notes`)
      await page.waitForLoadState('networkidle')

      await expect(page.locator('[role="button"]').filter({ hasText: 'First Note' })).toBeVisible()
      await expect(
        page.locator('[role="button"]').filter({ hasText: 'Second Note' }),
      ).toBeVisible()
      await expect(
        page.locator('[role="button"]').filter({ hasText: 'Searchable Unique XYZ' }),
      ).toBeVisible()
    })

    test('notes search filters results by title', async ({ page }) => {
      await page.goto(`${BASE_URL}/notes`)
      await page.waitForLoadState('networkidle')

      const searchInput = page.locator('input[placeholder*="Search"]')
      await searchInput.fill('Searchable Unique XYZ')
      // Wait for debounce (300ms) + API response
      await page.waitForLoadState('networkidle')

      await expect(
        page.locator('[role="button"]').filter({ hasText: 'Searchable Unique XYZ' }),
      ).toBeVisible()
      await expect(
        page.locator('[role="button"]').filter({ hasText: 'First Note' }),
      ).not.toBeVisible()
    })

    test('notes search shows empty state message for non-matching query', async ({ page }) => {
      await page.goto(`${BASE_URL}/notes`)
      await page.waitForLoadState('networkidle')

      const searchInput = page.locator('input[placeholder*="Search"]')
      await searchInput.fill('NONEXISTENT_QUERY_ZZZZZ')
      await page.waitForLoadState('networkidle')

      await expect(page.locator('text=No notes match your search.')).toBeVisible()
    })

    test('clicking a note card navigates to its detail page', async ({ page }) => {
      await page.goto(`${BASE_URL}/notes`)
      await page.waitForLoadState('networkidle')

      await page.locator('[role="button"]').filter({ hasText: 'First Note' }).click()
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveURL(/\/notes\/\w+/)
      await expect(page.locator('h1').first()).toHaveText('First Note')
      await expect(page.locator('text=Content of the first note')).toBeVisible()
    })

    test('note detail page shows edit button, delete button and back link', async ({ page }) => {
      await page.goto(`${BASE_URL}/notes`)
      await page.waitForLoadState('networkidle')

      await page.locator('[role="button"]').filter({ hasText: 'First Note' }).click()
      await page.waitForLoadState('networkidle')

      await expect(page.locator(`a[href="/notes"]`)).toBeVisible()
      await expect(page.locator('a:has-text("Edit")')).toBeVisible()
      await expect(page.locator('button:has-text("Delete")')).toBeVisible()
    })
  })
})
