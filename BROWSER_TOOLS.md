# Browser Tools

This project uses a dual-browser setup to give the AI agent full visual and programmatic control over the UI/UX:

## 1. Playwright (Visual Testing & Screenshots)

Playwright provides full browser automation with screenshot capabilities for visual verification.

### Installation

Browsers are already installed via:
```bash
npx playwright install chromium --with-deps
```

### Usage

Run E2E tests:
```bash
pnpm test:e2e
```

Take a screenshot programmatically:
```typescript
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3000');
await page.screenshot({ path: 'screenshot.png' });
await browser.close();
```

### Configuration

The Playwright config is at `playwright.config.ts`. The `baseURL` is set to `http://localhost:3000` for convenient relative URL navigation.

## 2. Lightpanda (Fast DOM Access via MCP)

Lightpanda is a lightweight headless browser configured as an MCP (Model Context Protocol) server for fast, programmatic DOM access.

### Installation

The `lightpanda` binary is installed at `/usr/local/bin/lightpanda`. To reinstall:
```bash
curl -L -o lightpanda https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-x86_64-linux
chmod a+x ./lightpanda
sudo mv ./lightpanda /usr/local/bin/
```

### MCP Configuration

Lightpanda is configured as an MCP server in `.claude/settings.json`:
```json
{
  "mcpServers": {
    "lightpanda": {
      "command": "lightpanda",
      "args": ["mcp"]
    }
  }
}
```

### Usage

Use Lightpanda for fast DOM queries and content verification:
```bash
# Fetch HTML from a page
lightpanda fetch --dump html https://example.com

# Fetch semantic tree for AI-friendly content
lightpanda fetch --dump semantic_tree https://example.com

# Start as CDP server for debugging
lightpanda serve --host 127.0.0.1 --port 9222
```

## When to Use Each

| Task | Tool |
|------|------|
| Visual screenshots | Playwright |
| E2E testing | Playwright |
| Fast DOM queries | Lightpanda |
| Content extraction | Lightpanda |
| Form interaction | Lightpanda |
| Full browser automation | Playwright |

## References

- [Playwright Documentation](https://playwright.dev/)
- [Lightpanda Browser](https://github.com/lightpanda-io/browser)
