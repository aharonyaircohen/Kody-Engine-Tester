import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { JSDOM } from 'jsdom'

test('UI review proof exposes an accessible working interaction', async () => {
  const html = await readFile(
    new URL('../public/ui-review-proof.html', import.meta.url),
    'utf8',
  )
  const dom = new JSDOM(html, { runScripts: 'dangerously' })
  const button = dom.window.document.querySelector('button')
  const status = dom.window.document.querySelector('[role="status"]')

  assert.equal(button?.textContent, 'Verify interaction')
  assert.equal(status?.textContent, 'Ready for review.')

  button?.click()

  assert.equal(status?.textContent, 'Interaction verified.')
})
