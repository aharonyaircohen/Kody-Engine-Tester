import { chromium } from '@playwright/test'

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium-browser', headless: true, args: ['--no-sandbox'] })
const context = await browser.newContext()
const page = await context.newPage()

// --- Homepage ---
await page.goto('http://localhost:3000')
await page.waitForLoadState('networkidle')
console.log('HOME title:', await page.title())
console.log('HOME h1:', await page.locator('h1').first().textContent())
console.log('HOME links:', await page.locator('a').allTextContents())

// --- Notes page ---
await page.goto('http://localhost:3000/notes')
await page.waitForLoadState('networkidle')
console.log('NOTES h1:', await page.locator('h1').first().textContent())
const noteElements = await page.locator('input, button, a[href]').evaluateAll(els => els.map(e => ({ tag: e.tagName, type: e.getAttribute('type'), text: e.textContent?.trim().substring(0,50), href: e.getAttribute('href'), placeholder: e.getAttribute('placeholder') })))
console.log('NOTES elements:', JSON.stringify(noteElements))

// --- Notes create ---
await page.goto('http://localhost:3000/notes/create')
await page.waitForLoadState('networkidle')
const createElements = await page.locator('input, textarea, button, label').evaluateAll(els => els.map(e => ({ tag: e.tagName, id: e.id, name: e.getAttribute('name'), type: e.getAttribute('type'), placeholder: e.getAttribute('placeholder'), text: e.textContent?.trim().substring(0,80) })))
console.log('NOTES CREATE elements:', JSON.stringify(createElements))

// --- Dashboard (should redirect to login) ---
await page.goto('http://localhost:3000/dashboard')
await page.waitForLoadState('networkidle')
console.log('DASHBOARD URL after redirect:', page.url())

// --- Admin login ---
await page.goto('http://localhost:3000/admin/login')
await page.waitForLoadState('networkidle')
const loginInputs = await page.locator('input').evaluateAll(els => els.map(e => ({ id: e.id, name: e.name, type: e.type })))
console.log('ADMIN LOGIN inputs:', JSON.stringify(loginInputs))

await browser.close()
