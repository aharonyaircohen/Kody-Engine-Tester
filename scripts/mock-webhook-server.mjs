#!/usr/bin/env node
// kody2 state-reducer verification
/**
 * Mock webhook server for local chat E2E testing.
 *
 * Listens for events POSTed by the Kody Engine's webhook hook and:
 *   - Logs them to stdout
 *   - Writes them to .kody-engine/mock-webhook-events.jsonl
 *
 * Usage:
 *   node scripts/mock-webhook-server.mjs [--port 8080]
 *
 * For GitHub Actions to reach this server, use a tunnel:
 *   npx localtunnel --port 8080
 *   # Or: npx serveo
 *
 * The public URL from localtunnel goes into KODY_WEBHOOK_URL.
 */

import http from 'http'
import fs from 'fs'
import path from 'path'
import { parseArgs } from 'util'

const { values: args } = parseArgs({
  options: {
    port: { type: 'string', default: '8080' },
    token: { type: 'string', default: '' },
  },
})

const PORT = parseInt(args.port, 10)
const EXPECTED_TOKEN = args.token || process.env.KODY_WEBHOOK_TOKEN || ''

const LOG_FILE = path.join(process.cwd(), '.kody-engine', 'mock-webhook-events.jsonl')

function ensureLogDir() {
  const dir = path.dirname(LOG_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function logEvent(body) {
  const line = JSON.stringify({ receivedAt: new Date().toISOString(), ...body })
  fs.appendFileSync(LOG_FILE, line + '\n')
  console.log(`[webhook] ${body.eventName} | runId=${body.runId} | sessionId=${body.sessionId || '?'}`)
}

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    })
    res.end()
    return
  }

  // GET: health check
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'mock webhook server ready',
      tokenRequired: EXPECTED_TOKEN.length > 0,
      logFile: LOG_FILE,
    }))
    return
  }

  // POST: receive event
  if (req.method === 'POST') {
    // Check Bearer token
    if (EXPECTED_TOKEN) {
      const auth = req.headers['authorization'] || ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth
      if (token !== EXPECTED_TOKEN) {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Unauthorized' }))
        return
      }
    }

    let body = ''
    for await (const chunk of req) body += chunk

    try {
      const event = JSON.parse(body)
      logEvent(event)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ received: true, eventId: event.eventId }))
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Invalid JSON' }))
    }
    return
  }

  res.writeHead(405)
  res.end('Method Not Allowed')
})

server.listen(PORT, () => {
  console.log(`[mock-webhook] Listening on http://localhost:${PORT}`)
  console.log(`[mock-webhook] Events will be logged to: ${LOG_FILE}`)
  if (EXPECTED_TOKEN) console.log(`[mock-webhook] Token auth enabled (KODY_WEBHOOK_TOKEN)`)
  else console.log(`[mock-webhook] WARNING: No token auth configured`)
  console.log('')
  console.log('For GitHub Actions to reach this:')
  console.log(`  npx localtunnel --port ${PORT}`)
  console.log('Then set KODY_WEBHOOK_URL to the tunnel URL (e.g. https://your-name.loca.lt/api/kody/events/chat)')
})

process.on('SIGINT', () => {
  console.log('\n[mock-webhook] Shutting down...')
  server.close()
  process.exit(0)
})
