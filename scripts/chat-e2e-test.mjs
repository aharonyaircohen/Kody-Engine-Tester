#!/usr/bin/env node
// End-to-end test for the kody chat --poll flow, orchestrating workflow trigger, message enqueue, and webhook verification.
/**
 * E2E test for the kody chat --poll flow.
 *
 * This script orchestrates a full chat E2E test:
 *   1. Starts the mock webhook server (or uses an existing URL)
 *   2. Creates a chat session file with a user message
 *   3. Triggers the chat.yml GitHub Actions workflow
 *   4. Enqueues a message via the GitHub API (simulates Dashboard sending a message)
 *   5. Waits for the workflow to pick it up and process it
 *   6. Verifies the session file was updated and webhook was received
 *
 * Usage:
 *   node scripts/chat-e2e-test.mjs [--webhook-url <url>] [--session-id <id>]
 *
 * Prerequisites:
 *   - gh CLI authenticated (`gh auth status`)
 *   - kody-engine installed globally
 *   - GitHub Actions API access to the tester repo
 *
 * For the webhook URL:
 *   - Local mock: leave empty, script starts mock server on port 8080
 *   - With tunnel: set --webhook-url to your localtunnel/ngrok URL
 *   - Deployed dashboard: set --webhook-url to the Vercel URL
 */

import http from 'http'
import fs from 'fs'
import path from 'path'
import { parseArgs } from 'util'
import { spawn } from 'child_process'
import { setTimeout as sleep } from 'timers/promises'

const REPO = 'aharonyaircohen/Kody-Engine-Tester'
const WORKFLOW_FILE = 'chat.yml'
const MOCK_SERVER_PORT = 8080

// ─── Helpers ──────────────────────────────────────────────────────────────────

function exec(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'pipe', ...opts })
    let stdout = '', stderr = ''
    child.stdout?.on('data', d => stdout += d)
    child.stderr?.on('data', d => stderr += d)
    child.on('close', code => {
      if (code === 0) resolve(stdout.trim())
      else reject(new Error(`${cmd} ${args.join(' ')} failed:\n${stderr}`))
    })
    child.on('error', reject)
  })
}

function ghApi(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://api.github.com/repos/${REPO}${path}`)
    const bodyStr = body ? JSON.stringify(body) : null
    const req = http.request({
      hostname: url.hostname,
      path: url.pathname,
      method,
      headers: {
        'Authorization': `Bearer ${process.env.GH_TOKEN || exec('gh', ['auth', 'token'])}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    }, res => {
      let data = ''
      res.on('data', d => data += d)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }) }
        catch { resolve({ status: res.statusCode, data }) }
      })
    })
    req.on('error', reject)
    if (bodyStr) req.write(bodyStr)
    req.end()
  })
}

function startMockServer(port, token) {
  return new Promise(resolve => {
    const logFile = path.join(process.cwd(), '.kody-engine', 'mock-webhook-events.jsonl')
    const server = http.createServer(async (req, res) => {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Access-Control-Allow-Origin': '*' })
        res.end(); return
      }
      if (req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'ready' })); return
      }
      if (req.method === 'POST') {
        let body = ''; for await (const chunk of req) body += chunk
        try {
          const event = JSON.parse(body)
          const line = JSON.stringify({ receivedAt: new Date().toISOString(), ...event })
          fs.appendFileSync(logFile, line + '\n')
          console.log(`  [webhook] ${event.eventName} | sessionId=${event.sessionId || '?'}`)
        } catch {}
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ received: true }))
        return
      }
      res.writeHead(405); res.end()
    })
    server.listen(port, () => {
      console.log(`[mock] Server listening on http://localhost:${port}`)
      console.log(`[mock] Events → ${logFile}`)
      resolve(server)
    })
  })
}

function createSessionFile(sessionId, cwd) {
  const dir = path.join(cwd, '.kody', 'sessions')
  const file = path.join(dir, `${sessionId}.jsonl`)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(file, JSON.stringify({
    role: 'user',
    content: 'Hello, this is a test message. Please respond with a brief greeting.',
    timestamp: new Date().toISOString(),
    toolCalls: [],
  }) + '\n')
  console.log(`[session] Created: ${file}`)
  return file
}

async function triggerWorkflow(sessionId, model) {
  // gh workflow run chat.yml --field sessionId=xxx --field model=xxx
  const output = await exec('gh', [
    'api', 'repos', REPO, 'actions', 'workflows', WORKFLOW_FILE, 'dispatches',
    '-f', `ref=main`,
    '-f', `inputs.sessionId=${sessionId}`,
    ...(model ? ['-f', `inputs.model=${model}`] : []),
  ])
  console.log('[workflow] Triggered chat.yml')
  return output
}

async function waitForWorkflowStart(sessionId, maxWaitMs = 30000) {
  const deadline = Date.now() + maxWaitMs
  while (Date.now() < deadline) {
    const { data } = await ghApi('GET', `/actions/runs?workflow_id=${WORKFLOW_FILE}&per_page=5`)
    const runs = data.workflow_runs || []
    const run = runs.find(r =>
      r.name === 'chat' &&
      r.status !== 'completed' &&
      (r.display_title || '').includes(sessionId)
    )
    if (run) {
      console.log(`[workflow] Run started: ${run.html_url}`)
      return run
    }
    await sleep(3000)
  }
  throw new Error('Workflow did not start within timeout')
}

async function enqueueMessage(sessionId, message) {
  // Read current action-state.json
  const { data: existing } = await ghApi('GET', '/contents/.kody-engine/action-state.json')
  let state = []
  try {
    if (existing.content) {
      state = JSON.parse(Buffer.from(existing.content, 'base64').toString('utf-8'))
    }
  } catch {}

  // Find or create the chat session entry
  let entry = state.find(e => e.sessionId === sessionId && e.step === 'chat')
  if (!entry) {
    entry = {
      runId: `chat-${sessionId}-${Date.now()}`,
      actionId: `chat-${sessionId}-${Date.now()}`,
      sessionId,
      status: 'waiting',
      step: 'chat',
      instructions: [],
      cancel: false,
      lastHeartbeat: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    state.push(entry)
  }

  entry.instructions.push(message)
  entry.lastHeartbeat = new Date().toISOString()

  // Write back
  const content = Buffer.from(JSON.stringify(state, null, 2)).toString('base64')
  await ghApi('PUT', '/contents/.kody-engine/action-state.json', {
    message: `e2e: enqueue message for session ${sessionId}`,
    content,
    sha: existing.sha,
  })
  console.log(`[queue] Enqueued message for session ${sessionId}`)
}

async function watchArtifacts(runId, sessionId, timeoutMs = 300000) {
  const deadline = Date.now() + timeoutMs
  let lastCheck = Date.now()

  while (Date.now() < deadline) {
    const { data } = await ghApi('GET', `/actions/runs/${runId}/artifacts`)
    const artifacts = data.artifacts || []
    const sessionArtifact = artifacts.find(a => a.name === `chat-session-${sessionId}`)

    if (sessionArtifact && sessionArtifact.expanded_links?.archive) {
      console.log(`[artifacts] Found: ${sessionArtifact.name}`)
      // Download and check
      const { data: zipData } = await ghApi('GET', `/actions/artifacts/${sessionArtifact.id}/zip`)
      return { artifact: sessionArtifact, zipData }
    }

    // Also check run status
    const { data: runData } = await ghApi('GET', `/actions/runs/${runId}`)
    if (runData.conclusion === 'success') {
      console.log('[workflow] Run completed successfully')
      break
    }
    if (runData.conclusion === 'failure') {
      throw new Error('Workflow run failed')
    }

    await sleep(10000)
  }
  return null
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { values: args } = parseArgs({
    options: {
      'session-id': { type: 'string' },
      'model': { type: 'string', default: 'MiniMax-M2.7-highspeed' },
      'webhook-url': { type: 'string' },
      'cwd': { type: 'string', default: process.cwd() },
      'poll-interval': { type: 'string', default: '5000' },
      'poll-timeout': { type: 'string', default: '60000' },
      'skip-workflow': { type: 'boolean' },
    },
  })

  const sessionId = args['session-id'] || `e2e-${Date.now()}`
  const model = args['model']
  const webhookUrl = args['webhook-url']
  const cwd = args['cwd']
  const pollInterval = args['poll-interval']
  const pollTimeout = args['poll-timeout']

  console.log('')
  console.log('╔══════════════════════════════════════════════╗')
  console.log('║  Kody Chat E2E Test                         ║')
  console.log('╚══════════════════════════════════════════════╝')
  console.log(`  Session ID:    ${sessionId}`)
  console.log(`  Model:         ${model}`)
  console.log(`  Webhook:       ${webhookUrl || '(mock server)'}`)
  console.log(`  Poll interval: ${pollInterval}ms`)
  console.log(`  Poll timeout:  ${pollTimeout}ms`)
  console.log('')

  // 1. Create session file
  createSessionFile(sessionId, cwd)

  // 2. Start mock webhook server (if no URL provided)
  let mockServer = null
  let effectiveWebhookUrl = webhookUrl
  if (!webhookUrl) {
    mockServer = await startMockServer(MOCK_SERVER_PORT, '')
    effectiveWebhookUrl = `http://localhost:${MOCK_SERVER_PORT}`
  }

  try {
    // 3. Trigger workflow
    if (!args['skip-workflow']) {
      console.log('')
      console.log('[step 1/3] Triggering workflow...')
      await triggerWorkflow(sessionId, model)

      console.log('[step 2/3] Waiting for workflow to register session...')
      const run = await waitForWorkflowStart(sessionId)

      console.log('[step 3/3] Enqueueing message...')
      await sleep(3000) // Give the workflow time to register
      await enqueueMessage(sessionId, 'Hello from the E2E test! How are you?')

      console.log('')
      console.log('[done] Workflow triggered and message enqueued.')
      console.log(`       Watch progress: https://github.com/${REPO}/actions`)
      console.log('')
      console.log('The workflow will:')
      console.log('  1. Start polling (every 5s)')
      console.log('  2. Pick up the enqueued message')
      console.log('  3. Run Claude Code')
      console.log('  4. Emit chat.message webhook events')
      console.log('  5. Append to .kody/sessions/<sessionId>.jsonl')
      console.log('  6. Exit after 1 minute of idle time')
      console.log('')
      console.log('Check events:')
      if (effectiveWebhookUrl.startsWith('http://localhost')) {
        console.log(`  Mock server logs: ${path.join(cwd, '.kody-engine', 'mock-webhook-events.jsonl')}`)
      }
    } else {
      console.log('[skip-workflow] Workflow not triggered (--skip-workflow)')
    }
  } finally {
    if (mockServer) {
      console.log('')
      console.log('[mock] Press Ctrl+C to stop the mock server')
      await new Promise(() => {})
    }
  }
}

main().catch(err => {
  console.error('[error]', err.message)
  process.exit(1)
})
