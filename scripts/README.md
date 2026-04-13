# Chat E2E Test

End-to-end test for the `kody chat --poll` bidirectional chat flow.

## Architecture

```
Dashboard/Local Test
    │
    ├── mock server: POST /chat-message
    │   ← engine emits chat.message, chat.done, chat.error webhooks
    │
    └── gh api: PUT .kody-engine/action-state.json (enqueue message)
          ↑ engine polls every 5s and processes messages

GitHub Actions (chat.yml, 6h timeout)
    │
    └── kody chat --poll --session <sessionId>
          → upsertChatSession(runId, sessionId)
          → loop: pollInstruction → processMessage → emit webhook
          → idle 6min → chat.done → exit
```

## Quick Test (no tunnel needed)

The chat workflow works without the webhook — messages get processed and appended
to the session file. The webhook is only for pushing events back to the Dashboard.

To verify the full flow works:

```bash
# 1. Run the test script (workflow + mock server)
node scripts/chat-e2e-test.mjs --session-id test-$(date +%s)

# 2. Watch the mock server logs for incoming webhooks
#    (starts on http://localhost:8080)

# 3. For GitHub Actions to reach your mock server, use a tunnel:
npx localtunnel --port 8080
# Note: LocalTunnel resets on restart. Use --subdomain for a stable URL.
```

## Full E2E Test with Tunnel

```bash
# Terminal 1: Start tunnel (gives you a public HTTPS URL)
npx localtunnel --port 8080
# → You'll see: "your-url.loca.lt" — copy this URL

# Terminal 2: Update the GitHub secret with the tunnel URL
gh secret set KODY_WEBHOOK_URL \
  --body "https://your-url.loca.lt" \
  --repo aharonyaircohen/Kody-Engine-Tester

# Terminal 3: Run the test
node scripts/chat-e2e-test.mjs \
  --session-id smoke-$(date +%s) \
  --webhook-url "https://your-url.loca.lt"
```

## Manual Test (via GitHub CLI)

```bash
REPO=aharonyaircohen/Kody-Engine-Tester
SESSION="manual-$(date +%s)"

# 1. Create session file
mkdir -p .kody/sessions
echo '{"role":"user","content":"Hello","timestamp":"2026-04-13T10:00:00Z","toolCalls":[]}' \
  > .kody/sessions/${SESSION}.jsonl

# 2. Trigger workflow
gh api repos/$REPO/actions/workflows/chat.yml/dispatches \
  -f ref=main \
  -f inputs.sessionId="$SESSION"

# 3. Wait 5s, then enqueue a message
sleep 5
SHA=$(gh api repos/$REPO/contents/.kody-engine/action-state.json --jq '.sha')
gh api repos/$REPO/contents/.kody-engine/action-state.json \
  --method PUT \
  -f message="Enqueue for $SESSION" \
  -f content="$(echo '[{"runId":"placeholder","actionId":"placeholder","sessionId":"'"$SESSION"'","status":"waiting","step":"chat","instructions":["Fix the auth bug"],"cancel":false,"lastHeartbeat":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'","createdAt":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}]' | base64)" \
  -f sha="$SHA"

# 4. Watch session file grow
gh api repos/$REPO/contents/.kody/sessions/${SESSION}.jsonl --jq '.content' \
  | base64 -d | tail -3

# 5. Check webhook was received (if tunnel is up)
cat .kody-engine/mock-webhook-events.jsonl | python3 -m json.tool
```

## Deploy Dashboard Webhook Endpoint

The Dashboard's webhook endpoint needs to be deployed to Vercel:

```bash
# 1. Push the new webhook route
git -C /Users/aguy/projects/Kody-Dashboard add app/api/kody/events/chat/
git -C /Users/aguy/projects/Kody-Dashboard commit -m "feat: webhook listener for kody chat events"
git -C /Users/aguy/projects/Kody-Dashboard push

# 2. Wait for Vercel deploy, then update the secret
gh secret set KODY_WEBHOOK_URL \
  --body "https://aguy.co.il/api/kody/events/chat" \
  --repo aharonyaircohen/Kody-Engine-Tester
```

## Files

| File | Purpose |
|------|---------|
| `.github/workflows/chat.yml` | GitHub Actions workflow for long-running chat sessions |
| `scripts/mock-webhook-server.mjs` | Standalone mock webhook receiver for local testing |
| `scripts/chat-e2e-test.mjs` | Orchestrates a full E2E test run |
| `scripts/README.md` | This file |
