import { chromium } from '@playwright/test'

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium-browser', headless: true, args: ['--no-sandbox'] })
const context = await browser.newContext()
const page = await context.newPage()

// Create a note and observe redirect
await page.goto('http://localhost:3000/notes/create')
await page.waitForLoadState('networkidle')

// Fill the form
const titleInput = page.locator('input[type="text"]').first()
const contentTextarea = page.locator('textarea').first()
const tagsInput = page.locator('input[type="text"]').nth(1)

await titleInput.fill('Test Note Title')
await contentTextarea.fill('This is the note content for testing purposes.')
await tagsInput.fill('e2e, testing')

// Click Create
await page.locator('button[type="submit"]').click()
await page.waitForLoadState('networkidle')
console.log('AFTER CREATE URL:', page.url())

// Inspect result page
const afterCreateH1 = await page.locator('h1').first().textContent().catch(() => 'none')
const afterCreateContent = await page.content()
console.log('AFTER CREATE h1:', afterCreateH1)
console.log('AFTER CREATE has title:', afterCreateContent.includes('Test Note Title'))
console.log('AFTER CREATE URL again:', page.url())

// Go to notes list, check the note is there
await page.goto('http://localhost:3000/notes')
await page.waitForLoadState('networkidle')
const notesListContent = await page.content()
console.log('NOTES LIST has "Test Note Title":', notesListContent.includes('Test Note Title'))

// Find the note card
const noteCards = await page.locator('[class*="card"], [class*="Card"], h2, h3').allTextContents()
console.log('NOTE CARDS:', noteCards.slice(0, 10))

// Check search functionality
const searchInput = page.locator('input[placeholder*="Search"]').first()
await searchInput.fill('Test Note')
await page.waitForTimeout(500) // wait for debounce
const searchResults = await page.content()
console.log('SEARCH has "Test Note Title":', searchResults.includes('Test Note Title'))

// Clear search
await searchInput.fill('')
await page.waitForTimeout(500)

// Try clicking on a note card
const noteCardLink = page.locator('a[href*="/notes/"]').first()
const noteCardHref = await noteCardLink.getAttribute('href').catch(() => null)
console.log('NOTE CARD href:', noteCardHref)

if (noteCardHref) {
  await page.goto(`http://localhost:3000${noteCardHref}`)
  await page.waitForLoadState('networkidle')
  console.log('NOTE DETAIL URL:', page.url())
  const noteDetailElements = await page.locator('h1, h2, p, button, a').evaluateAll(els => els.map(e => ({ tag: e.tagName, text: e.textContent?.trim().substring(0,100), href: e.getAttribute('href') })))
  console.log('NOTE DETAIL elements:', JSON.stringify(noteDetailElements.slice(0, 15)))
}

await browser.close()
