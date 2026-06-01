# Cookie Auth & sweet-cookie

Most authenticated web apps use **cookie-based auth** — the browser holds session cookies (`auth_token`, `ct0`, `x-bbx-csrf-token`, `IADVISITOR`, `RequestVerificationToken`, etc.) and sends them with every API request. No anti-bot, no PoW — just cookies.

For these sites, you can read the cookies from the browser's local DB and replay the API call from `curl` with the right `Cookie` header.

## Tool: `@steipete/sweet-cookie`

Reads cookies directly from Chrome/Firefox/Safari's local SQLite/cookies DB. No browser launch needed.

### Install

```bash
npm install @steipete/sweet-cookie
```

Or use the CLI directly from the source tree:

```bash
node /path/to/sweet-cookie/packages/core/dist/cli.js <domain> --format header
```

### Read cookies programmatically

```js
import { getCookies, toCookieHeader } from "@steipete/sweet-cookie";

const { cookies, warnings } = await getCookies({
  url: "https://target.com",
  browsers: ["chrome"],
  chromeProfile: `${process.env.HOME}/Library/Application Support/Google/Chrome/Default`,
});

const cookieHeader = toCookieHeader(cookies, { dedupeByName: true });
console.log(cookieHeader);
```

### Read cookies via CLI

```bash
node /path/to/sweet-cookie/packages/core/dist/cli.js target.com --format header
# → name1=value1; name2=value2; ...

node /path/to/sweet-cookie/packages/core/dist/cli.js target.com --format json | jq '.[].name'
# → list of cookie names

node /path/to/sweet-cookie/packages/core/dist/cli.js target.com --format json \
  | jq -r '.[] | select(.name == "x-bbx-csrf-token") | .value'
# → extract a specific cookie value
```

## Replay with Cookies

```bash
COOKIES=$(node .../cli.js target.com --format header 2>/dev/null)
curl -s -H "Cookie: $COOKIES" \
     -H "User-Agent: Mozilla/5.0 ..." \
     -H "Content-Type: application/json" \
     "https://target.com/api/endpoint"
```

## CSRF Token Patterns

Many sites have CSRF tokens stored as cookies. The token is usually sent as a **separate header** (not just in the cookie).

| Cookie name | Header name | Used by |
|-------------|-------------|---------|
| `x-bbx-csrf-token` | `x-bbx-csrf-token` | Willhaben-style |
| `ct0` | `x-csrf-token` | X/Twitter-style |
| `RequestVerificationToken` | `X-RequestVerificationToken` | ASP.NET-style |
| `csrf_token` | `X-CSRF-Token` | Generic Rails/Django |

**Pattern:** read the cookie, extract its value, pass as a header with the same name (or whatever the API expects).

```bash
# Extract and replay
CSRF=$(node .../cli.js target.com --format json | jq -r '.[] | select(.name == "csrf_cookie_name") | .value')
curl -s -H "Cookie: $COOKIES" -H "X-CSRF-Token: $CSRF" "https://target.com/api/endpoint"
```

## Validation Patterns

After getting cookies, confirm the session is valid before replaying API calls.

### Approach 1: Hit a known-authenticated endpoint

Many sites have a `/me` or `/account` endpoint that returns user data only when authenticated.

```bash
curl -s -H "Cookie: $COOKIES" "https://target.com/api/me" | jq .
# 200 with user data → session valid
# 401/403 → session expired or cookies wrong
```

### Approach 2: Check SSR data in homepage

If the site renders logged-in state in the homepage HTML, fetch and parse.

```js
const html = await fetch("https://target.com/", { headers: { Cookie: cookieHeader } }).then(r => r.text());
const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.+?)<\/script>/);
const data = match ? JSON.parse(match[1]) : null;
// Look for user data: data.props.pageProps.user, data.user, etc.
```

## ⚠️ Gotchas

### sweet-cookie reads regular Chrome, NOT Chrome Beta

Chrome DevTools MCP connects to Chrome Beta (`--channel=beta`). sweet-cookie reads from regular Chrome (`Google/Chrome`). Both must be logged into the same account.

If you only have Chrome Beta logged in, either:
- Log into the same account in regular Chrome too, or
- Use a different discovery method (see [anti-bot.md](anti-bot.md))

### Chrome v20+ encrypts cookies

Newer Chrome versions encrypt cookie values. If `getCookies()` returns warnings about encryption:

```js
const { cookies, warnings } = await getCookies({ ... });
console.warn(warnings);
// → ["Chrome cookie encrypted_value is in an unsupported type.", ...]
```

**Workarounds:**
- Close regular Chrome before calling (Chrome writes plaintext cookies when closed)
- Use the CDP fallback in sweet-cookie (set `useCdp: true` if supported)
- Use a different browser (Firefox doesn't encrypt cookies)

### SameSite=Strict cookies won't cross domains

If the API is on a different subdomain than the cookie was set on, SameSite=Strict cookies won't be sent. Check the `sameSite` field in the cookie JSON.

## See Also

- [cookie-sources.md](cookie-sources.md) — picking the right browser profile
- [anti-bot.md](anti-bot.md) — when sweet-cookie isn't enough
- [../scripts/cookie-fetch.sh](../scripts/cookie-fetch.sh) — generic sweet-cookie wrapper
- [../scripts/examples/](../scripts/examples/) — usage examples
