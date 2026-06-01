# Anti-Bot Bypass

Some sites use client-side anti-bot SDKs (Kasada/PerimeterX, Cloudflare Turnstile, DataDome, Shape Security, etc.) that require **JS-computed proof-of-work tokens** in request headers. These tokens are NOT stored as cookies — they're generated per-request by client-side JavaScript.

## Why sweet-cookie Fails

sweet-cookie reads static cookies from the browser's DB. Anti-bot tokens:
- Are computed dynamically (per-request, time-bound)
- Live in request headers, not cookies
- Depend on a JS execution context with the SDK loaded

So `curl` with sweet-cookie cookies will return 429/403 on protected POSTs.

## The Solution: evaluate_script

The anti-bot SDK is already running inside the browser page. If you inject a `fetch()` call from that same page context, the browser auto-attaches the computed tokens.

### Basic pattern

```js
// Paste this into Chrome DevTools console, or send via MCP:
async () => {
  const resp = await fetch('https://target.com/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'value' }),
    credentials: 'include'  // CRITICAL — sends cookies from page context
  });
  return {
    status: resp.status,
    body: await resp.text()
  };
}
```

`credentials: 'include'` is the key — it tells the browser to include all cookies and tokens as if the page itself made the request.

### Via MCP

```
mcp({
  tool: "chrome_devtools_evaluate_script",
  args: { function: "async () => { const resp = await fetch('...', { method: 'POST', credentials: 'include' /* ... */ }); return { status: resp.status, body: await resp.text() }; }" }
})
```

### Extracting the response

```js
async () => {
  const resp = await fetch('...', { /* ... */ });
  const data = await resp.json();
  return data.flights.map(f => ({
    flight: f.carrierCode + f.flightNumber,
    departure: f.departureDateTime,
    price: f.fares?.[0]?.basePrice?.amount
  }));
}
```

## When to Use This

| Endpoint type | Strategy |
|---------------|----------|
| GET, no anti-bot | `curl` works fine |
| POST, no anti-bot | `curl` works fine |
| GET with session cookies | `curl` + sweet-cookie |
| POST with session cookies + Kasada | **`evaluate_script`** |
| POST with rotating query IDs (GraphQL) | `evaluate_script` (read fresh IDs from page) |

## When This Doesn't Work

| Issue | Symptom | Cause |
|-------|---------|-------|
| Sensor stuck in detection loop | Status 400 from Chrome Beta | The SDK detected automation; needs a real human session |
| Missing required headers | 400 "missing field X" | You forgot a non-Kasada header (CSRF token, version, etc.) |
| TLS fingerprint check | 403 with empty body | Server checks client fingerprint; spoofed clients rejected |
| IP-based rate limit | 429 even from browser | Too many requests; wait or use different IP |

## Patterns

### Pattern 1: Generate the JS dynamically

For parameterized calls, generate the JS from a shell script:

```bash
# ./scripts/wizz-search.sh DEP ARR DATE
# Output: JS function that takes those params
./scripts/wizz-search.sh BTS LTN 2026-07-15 | \
  xargs -I {} mcp --tool chrome_devtools_evaluate_script --function {}
```

### Pattern 2: Reuse across calls

```js
// Define once in page console
window.__searchAPI = async (dep, arr, date) => {
  const resp = await fetch('https://target.com/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dep, arr, date, /* ... */ }),
    credentials: 'include'
  });
  return resp.json();
};

// Then call repeatedly
window.__searchAPI('BTS', 'LTN', '2026-07-15')
```

### Pattern 3: Capture the original request as a template

If the browser already makes the request you want, you can intercept and copy it:

```js
// Patch fetch in page context
const origFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('FETCH:', args[0], args[1]);
  return origFetch(...args);
};
```

Then trigger the user action. Every fetch call is logged with full headers — copy and replay.

## When evaluate_script Fails: Other Options

| Tool | Use case |
|------|----------|
| **rodney** (headless Chrome CLI) | Run JS in a persistent headless Chrome. May or may not bypass anti-bot (some SDKs detect headless mode). |
| **mitmproxy** + custom JS solver | Intercept PoW challenge, solve it with a JS script that mimics the SDK, replay with tokens. Time-sensitive. |
| **Puppeteer/Playwright** (stealth mode) | Drive a real browser with anti-detection patches. Most likely to bypass but heaviest setup. |

## See Also

- [patterns/evaluate-script.md](patterns/evaluate-script.md) — full JS injection patterns
- [auth-cookies.md](auth-cookies.md) — when sweet-cookie alone is enough
- [../scripts/](../scripts/) — generic and site-specific helper scripts
