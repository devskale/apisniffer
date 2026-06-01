# Browser Cookie Sources

When using sweet-cookie, you need to know which browser (and which profile) the cookies live in. Different browsers store cookies in different formats and locations.

## The Big Gotcha: Chrome vs Chrome Beta

| Browser | Path (macOS) | Used by |
|---------|--------------|---------|
| **Regular Chrome** | `~/Library/Application Support/Google/Chrome/` | sweet-cookie (default) |
| **Chrome Beta** | `~/Library/Application Support/Google/Chrome Beta/` | Chrome DevTools MCP |
| **Chrome Canary** | `~/Library/Application Support/Google/Chrome Canary/` | — |
| **Chromium** | `~/Library/Application Support/Chromium/` | — |
| **Edge** | `~/Library/Application Support/Microsoft Edge/` | — |
| **Brave** | `~/Library/Application Support/BraveSoftware/Brave-Browser/` | — |
| **Arc** | `~/Library/Application Support/Arc/User Data/` | — |
| **Firefox** | `~/Library/Application Support/Firefox/Profiles/` | — |
| **Safari** | `~/Library/Cookies/Cookies.binarycookies` | — |

**Rule:** Chrome DevTools MCP runs Chrome **Beta**. sweet-cookie reads from regular **Chrome** by default. The accounts MUST match for the cookies to be valid for the same site.

## Cross-Browser Patterns

### Same account in two browsers

If you need to sniff in Chrome Beta (for MCP) but read cookies from regular Chrome:

1. Log into the target site in **both** browsers with the same account
2. Sniff in Chrome Beta (MCP)
3. Read cookies from regular Chrome (sweet-cookie default)

### Only logged in on Chrome Beta?

Use sweet-cookie with a different profile path:

```js
const { cookies } = await getCookies({
  url: "https://target.com",
  browsers: ["chrome"],
  chromeProfile: `${process.env.HOME}/Library/Application Support/Google/Chrome Beta/Default`,
});
```

But the `chrome` reader in sweet-cookie is hardcoded to the regular Chrome path. To read Chrome Beta specifically, use the **direct profile path** option.

### Only logged in on Firefox?

```js
const { cookies } = await getCookies({
  url: "https://target.com",
  browsers: ["firefox"],
  firefoxProfile: "default-release",
});
```

Firefox doesn't encrypt cookies (as of recent versions), so sweet-cookie works cleanly.

### Safari

```js
const { cookies } = await getCookies({
  url: "https://target.com",
  browsers: ["safari"],
});
```

Safari uses an encrypted binary format. sweet-cookie may need keychain access (you'll be prompted for password on first read).

## Encryption Notes

| Browser | Cookie encryption | sweet-cookie works? |
|---------|------------------|---------------------|
| Chrome (all channels) | Encrypted via Safe Storage (v20+) | ⚠️ May need closed Chrome or CDP fallback |
| Firefox | Not encrypted | ✅ Works clean |
| Safari | Encrypted binarycookies | ⚠️ Needs keychain access |
| Edge | Encrypted (similar to Chrome) | ⚠️ Same as Chrome |

**For Chrome encryption:** Chrome stores the encryption key in macOS Keychain as "Chrome Safe Storage". sweet-cookie uses this to decrypt cookies. If decryption fails:

- Check keychain permissions for your terminal
- Close Chrome (Chrome may hold keychain access exclusively)
- Use a different browser

## Multiple Profiles

Most browsers support multiple profiles (e.g. "Default", "Profile 1", "Profile 2", "Work").

### Chrome

```js
const { cookies } = await getCookies({
  url: "https://target.com",
  browsers: ["chrome"],
  chromeProfile: "Profile 2",  // not "Default"
});
```

### Firefox

```js
const { cookies } = await getCookies({
  url: "https://target.com",
  browsers: ["firefox"],
  firefoxProfile: "default-release",  // or custom profile name
});
```

### Direct path to any Chromium-based browser

```js
const { cookies } = await getCookies({
  url: "https://target.com",
  browsers: ["chrome"],
  chromeProfile: "/path/to/BraveSoftware/Brave-Browser/Default",
});
```

## Environment Variables

sweet-cookie reads these env vars for defaults:

| Variable | Purpose |
|----------|---------|
| `SWEET_COOKIE_CHROME_PROFILE` | Default Chrome profile name |
| `SWEET_COOKIE_FIREFOX_PROFILE` | Default Firefox profile name |
| `SWEET_COOKIE_BROWSERS` | Comma-separated browser list |
| `SWEET_COOKIE_MODE` | `merge` (default) or `first` |
| `SWEET_COOKIE_TIMEOUT` | Keychain read timeout (ms) |

## Quick Diagnostic

Not sure which browser has the cookies? Run:

```bash
for browser in chrome firefox safari; do
  echo "=== $browser ==="
  node .../cli.js target.com --browser $browser --format names 2>&1 | head -5
done
```

The one that returns cookie names is the one with a valid session.

## See Also

- [auth-cookies.md](auth-cookies.md) — sweet-cookie workflow
- [../scripts/cookie-fetch.sh](../scripts/cookie-fetch.sh) — generic cookie reader wrapper
