# APISniffer

Discover, validate, and document HTTP APIs from live browser traffic.

## Tools

| Tool | Purpose |
|------|---------|
| **Chrome DevTools MCP** | Sniff live browser traffic, run JS in page context |
| **sweet-cookie** | Read browser cookies for CLI replay |
| `curl` + `jq` | Validate and inspect |

## Setup

1. Chrome Beta running → `mcp({ connect: "chrome-devtools" })`
2. sweet-cookie installed → reads from **regular Chrome** (not Beta)

**Gotchas:**
- MCP `reqid` must be a **number**, not a string
- sweet-cookie reads Chrome (`Google/Chrome`), MCP connects Chrome Beta (`Google/Chrome Beta`) — both must be logged in

## Workflow

```
1. NAVIGATE  → mcp chrome_devtools_navigate_page
2. CAPTURE   → mcp chrome_devtools_list_network_requests
3. INSPECT   → mcp chrome_devtools_get_network_request { reqid: N }
4. CLASSIFY  → open | cookie-auth | anti-bot
5. VALIDATE  → curl | sweet-cookie + curl | evaluate_script
6. DOCUMENT  → APIs/{name}/
```

## Three Auth Patterns

### Open
```bash
curl -s "https://api.target.com/endpoint" | jq .
```

### Cookie-auth
```bash
COOKIES=$(node .../sweet-cookie/cli.js target.com --format header)
curl -s -H "Cookie: $COOKIES" "https://target.com/api/endpoint"
```

### Anti-bot (Kasada, PerimeterX, Turnstile)
curl returns 429/403. JS-computed PoW tokens, not cookies. Bypass by running fetch inside the page:
```
mcp({ tool: "chrome_devtools_evaluate_script", args: { function: "async () => {
  const r = await fetch('https://target.com/api/search', {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'value' })
  });
  return { status: r.status, body: await r.text() };
}" } })
```

`credentials: 'include'` — browser auto-sends cookies AND anti-bot tokens.

## Docs

| Doc | What |
|-----|------|
| [docs/anti-bot.md](docs/anti-bot.md) | Anti-bot bypass patterns |
| [docs/auth-cookies.md](docs/auth-cookies.md) | sweet-cookie usage, CSRF tokens |
| [docs/cookie-sources.md](docs/cookie-sources.md) | Chrome vs Beta vs Firefox vs Safari |

## Discovered APIs

`APIs/` → `~/code/APIs/`. Each API gets its own directory with themed docs and scripts.

## Guidelines

- **Validate every endpoint** — discovery ≠ confirmation
- **Classify auth** — open / cookie-auth / anti-bot
- **Document immediately** — don't re-reverse the same API
- **Split into themed files** — not one monster doc
- **Develop helper scripts during sniffing** — not before
- **Sanitize secrets** — never commit real tokens or cookies
