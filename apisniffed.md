# APISniffed — Discovered & Documented APIs

A living index of all HTTP APIs reverse-engineered through this project using Chrome DevTools MCP, sweet-cookie, and manual validation.

---

## Summary

| Metric | Count |
|--------|-------|
| **APIs Discovered** | 12+ |
| **Auth Patterns** | 3 (open, cookie-auth, anti-bot) |
| **Themed Docs** | 30+ |
| **Helper Scripts** | 10+ |
| **Domains Covered** | Real estate, travel, e-commerce, social, government |

---

## Discovered APIs

### 🏛️ Austrian Government & Real Estate

| API | Base URL | Auth | Docs | Status |
|-----|----------|------|------|--------|
| **BEV Kataster** | `kataster.bev.gv.at` | Open | [`APIs/kataster-bev/`](APIs/kataster-bev/) | ✅ Complete |
| **Willhaben** | `willhaben.at` | Cookie | [`APIs/willhaben/`](APIs/willhaben/) | ✅ Complete |
| **DerStandard Immo** | `derstandard.at/immo` | TBD | [`APIs/derstandard-immo/`](APIs/derstandard-immo/) | ✅ Documented |
| **Firmenbuch** | `firmenbuch.at` | TBD | [`APIs/firmenbuch/`](APIs/firmenbuch/) | ✅ Documented |
| **WKO Firmen** | `wko.at` | TBD | [`APIs/wko-firmen/`](APIs/wko-firmen/) | ✅ Documented |

**Key Endpoints:**
- BEV: `/api/all/` (search), `/api/gst/{kg}/{gnr}/` (parcel detail)
- Willhaben: Search, listings, favorites, messaging, images APIs

---

### ✈️ Travel & Airlines

| API | Base URL | Auth | Docs | Status |
|-----|----------|------|------|--------|
| **Ryanair** | `ryanair.com` | TBD | [`APIs/ryanair/`](APIs/ryanair/) | ✅ Documented |
| **Wizz Air** | `wizzair.com` | Cookie | [`APIs/wizzair/`](APIs/wizzair/) | ✅ Complete |

**Key Endpoints:**
- Ryanair: Fares search, booking flow
- Wizz Air: Search, auth, locations, assets

---

### 🛒 E-commerce & Price Comparison

| API | Base URL | Auth | Docs | Status |
|-----|----------|------|------|--------|
| **Geizhals** | `geizhals.at` | TBD | [`APIs/geizhals/`](APIs/geizhals/) | ✅ Documented |
| **Energie APIs** | Various | TBD | [`APIs/EnergieApis/`](APIs/EnergieApis/) | ✅ Documented |

---

### 🐦 Social Media

| API | Base URL | Auth | Docs | Status |
|-----|----------|------|------|--------|
| **X/Twitter** | `twitter.com` / `x.com` | Anti-bot | [`APIs/x-twitter/`](APIs/x-twitter/) | ✅ Complete |
| **Reddit** | `reddit.com` | TBD | [`APIs/reddit/`](APIs/reddit/) | ✅ Documented |

**Key Endpoints:**
- Twitter: Auth, timeline read, tweet write, media upload
- Reddit: Basic feed and post APIs

---

## Auth Patterns Discovered

### 1. Open APIs
No authentication required. CORS often enabled.

**Examples:** BEV Kataster, Geizhals (partial)

```bash
curl -s "https://kataster.bev.gv.at/at.gv.bev.kataster/api/gst/01107/2311/" | jq .
```

---

### 2. Cookie-Authenticated
Requires session cookies from logged-in browser. Extracted via sweet-cookie.

**Examples:** Willhaben, Wizz Air, X/Twitter (read operations)

```bash
COOKIES=$(node sweet-cookie/cli.js willhaben.at --format header)
curl -s -H "Cookie: $COOKIES" "https://www.willhaben.at/api/..."
```

---

### 3. Anti-Bot Protected
Protected by Kasada, PerimeterX, Cloudflare Turnstile, etc. Requires JS-computed tokens.

**Examples:** X/Twitter (write operations), some Ryanair endpoints

**Bypass:** Execute fetch inside browser context:
```javascript
mcp({ tool: "chrome_devtools_evaluate_script", args: { function: "async () => {
  const r = await fetch('https://api.target.com/endpoint', {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'value' })
  });
  return { status: r.status, body: await r.text() };
}" } })
```

---

## Project Documentation

| Doc | Purpose |
|-----|---------|
| [`docs/anti-bot.md`](docs/anti-bot.md) | Anti-bot bypass patterns, PoW tokens, in-browser fetch |
| [`docs/auth-cookies.md`](docs/auth-cookies.md) | Cookie extraction, CSRF tokens, session management |
| [`docs/cookie-sources.md`](docs/cookie-sources.md) | Browser profile paths, Chrome vs Beta vs Firefox |
| [`katasters.md`](katasters.md) | Austrian parcel lookup workflow, all available tools |
| [`restaurants.md`](restaurants.md) | Vienna restaurants catalog (69 locations) |

---

## Helper Scripts Created

| Script | Purpose |
|--------|---------|
| `APIs/wizzair/scripts/*` | Wizz Air search, auth, location lookup |
| `APIs/derstandard-immo/scripts/*` | DerStandard property search |
| `restaurants/app.js` | Vienna restaurants interactive viewer |

---

## Tools & Techniques

### Primary Tooling
- **Chrome DevTools MCP** — Live traffic capture, in-page JS execution
- **sweet-cookie** — Cookie extraction from regular Chrome
- **curl + jq** — API validation and inspection

### Workflow
```
1. NAVIGATE  → Open target site in Chrome Beta
2. CAPTURE   → List network requests via MCP
3. INSPECT   → Examine request/response details
4. CLASSIFY  → Identify auth pattern (open/cookie/anti-bot)
5. VALIDATE  → Replay with curl or in-browser fetch
6. DOCUMENT  → Write themed docs in APIs/{name}/
```

---

## Notable Findings

### BEV Kataster (Austria)
- **Fully open API** — no auth, no rate limits, CORS enabled
- Returns parcel area (m²), boundaries, usage codes, land register ID
- Test address: Krausegasse 23, 1110 Wien → **227 m²**

### Willhaben (Austria's largest marketplace)
- Cookie-authenticated with session tokens
- 8 themed docs covering full platform functionality
- Search, listings, favorites, messaging, images all documented

### X/Twitter
- Mixed auth: read = cookie, write = anti-bot (Kasada/turnstile)
- Requires in-browser fetch for protected endpoints
- Full CRUD + media upload documented

### Wizz Air
- Cookie-authenticated search and booking APIs
- Helper scripts for automated queries
- Asset CDN and location APIs reverse-engineered

---

## Sniffing Sessions

| Date | Target | Outcome |
|------|--------|---------|
| 2026-06-01 | BEV Kataster | ✅ Open API, full docs |
| 2026-06-01 | Willhaben | ✅ Cookie-auth, 8 docs |
| 2026-06-01 | Ryanair / Wizz Air | ✅ Flight search APIs |
| 2026-06-01 | X/Twitter | ✅ Anti-bot bypass documented |
| 2026-06-03 | Kataster deep-dive | ✅ Parcel workflow, test address |
| 2026-06-04 | Vienna Restaurants | ✅ 69 locations catalogued |

---

## Guidelines Followed

- ✅ **Validate every endpoint** — discovery ≠ confirmation
- ✅ **Classify auth** — open / cookie-auth / anti-bot
- ✅ **Document immediately** — don't re-reverse the same API
- ✅ **Split into themed files** — not one monster doc
- ✅ **Develop helper scripts during sniffing** — not before
- ✅ **Sanitize secrets** — no real tokens or cookies committed

---

## Next Targets

Potential APIs to discover:
- [ ] Austrian train APIs (ÖBB)
- [ ] Food delivery services (Lieferando, Mjam)
- [ ] Event ticketing (Eventim, oeticket)
- [ ] Banking APIs ( Erste, Raiffeisen — read-only)
- [ ] More government portals (USP, FinanzOnline)

---

*Last updated: 2026-06-19*
