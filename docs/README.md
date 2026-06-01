# APISniffer Docs

Reference docs for the APISniffer pack. Generic, reusable across targets.

## Core Concepts

| Doc | Covers |
|-----|--------|
| [auth-cookies.md](auth-cookies.md) | sweet-cookie workflow, reading Chrome's cookie DB, cookie-header construction |
| [anti-bot.md](anti-bot.md) | Kasada / PerimeterX / Turnstile — why sweet-cookie can't bypass, the `evaluate_script` solution |
| [cookie-sources.md](cookie-sources.md) | Chrome vs Chrome Beta, Firefox, Safari — picking the right browser profile |

## Patterns

| Doc | Covers |
|-----|--------|
| [patterns/evaluate-script.md](patterns/evaluate-script.md) | JS injection patterns — fetch from page context, extract SSR data, modify state |
| [patterns/batch-queries.md](patterns/batch-queries.md) | Scanning many routes/endpoints efficiently (batched requests, parallelism) |
| [patterns/helper-scripts.md](patterns/helper-scripts.md) | Writing reproducible shell scripts for replay and validation |
| [patterns/ssr-data.md](patterns/ssr-data.md) | Extracting `__NEXT_DATA__`, `__NUXT__`, and other embedded SSR payloads |
| [patterns/cookie-extraction.md](patterns/cookie-extraction.md) | When to use cookies vs CSRF tokens, header construction |

## Discovered APIs Index

See [discovered/README.md](discovered/README.md) — index of all reverse-engineered APIs in `APIs/`.

## See Also

- [../AGENTS.md](../AGENTS.md) — main pack overview
- [../scripts/](../scripts/) — generic helper scripts
- [../APIs/](../APIs/) — site-specific docs and helpers
