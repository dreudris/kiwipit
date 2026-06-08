# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Companion docs: `README.md` is the user-facing overview (with a Mermaid architecture diagram). `.claude/memory/MEMORY.md` indexes prior-session context that auto-loads into future Claude sessions (see the Claude memory section below for the symlink setup).

## Project

**Pitfolio** — a multi-chain crypto wallet viewer deployed at [kiwipit.dreudris.com](https://kiwipit.dreudris.com) via Cloudflare Workers (Static Assets + a small Worker for the Solana proxy). The project directory and Cloudflare Worker are both named `kiwipit`; the user-facing brand is "Pitfolio". The owner uses `dreudris.com` only as a parent domain for per-project test subdomains (`<project>.dreudris.com`) and serves nothing from the bare root.

No build step for the frontend. Pure HTML/CSS/JS — edit and push to deploy.

## Working with the owner (teaching mode)

The repo owner is **new to web development and JavaScript** and is learning by working on this project. Adjust how you work with them:

- **README is the learner-facing overview.** Keep a plain-English "how the whole thing works" walkthrough in `README.md` aimed at someone newer to JS/web. When you change architecture (new chain, new proxy route, new export feature, etc.), update that walkthrough so it stays in sync. CLAUDE.md is for Claude-internal context; the README is where the owner reads to understand their own code.
- **Teach while you work.** When you make a non-trivial change, briefly explain *what* you did and *why* in plain language — name the JS/web concept involved (event listeners, async/await, fetch, DOM IDs, BigInt, CSS variables, etc.) and tie it to what's happening in the file. A sentence or two per change is enough; this is in addition to the normal terse summary, not a replacement for doing the work.
- **Repetition is welcome.** If a concept came up two weeks ago, it's fine to re-explain it briefly the next time it's relevant. Don't assume prior explanations stuck — the goal is reinforcement.
- **Favor explanations that build independence.** When there's a choice between "here's the one-line fix" and "here's the fix plus the pattern so you'd spot it next time," lean toward the latter. The owner wants to eventually make these changes themselves without Claude.
- **Flag jargon.** If a term is unavoidable (e.g. "SRI hash", "CORS", "JSON-RPC", "wei"), give a one-line gloss the first time it appears in a response.

## Local development

**Run dev tools in Docker, not on the host.** The owner prefers to keep their Linux clean: don't install Node, wrangler, Python, linters, or any other language tool directly via `apt`, `npm -g`, `pip`, `npx`, or similar. Use a throwaway container instead. `git` and `curl` on the host are fine (they're already standard system tools and don't pollute anything).

The canonical local-dev command is therefore:

```bash
docker run --rm -it \
  -v "$(pwd):/app" -w /app \
  -p 8787:8787 \
  node:lts \
  npx wrangler dev --ip 0.0.0.0
```

Explanation of the flags (for the learner):
- `--rm` — delete the container as soon as it exits, so nothing accumulates
- `-it` — interactive terminal (so Ctrl-C reaches wrangler)
- `-v "$(pwd):/app" -w /app` — mount the current repo into the container at `/app` and make it the working directory; file edits on the host are visible immediately inside the container
- `-p 8787:8787` — forward container port 8787 to host port 8787, so `http://localhost:8787` on the host reaches wrangler inside the container
- `node:lts` — official Node.js long-term-support image; pulled the first time, cached locally afterwards
- `npx wrangler dev --ip 0.0.0.0` — `--ip 0.0.0.0` is required because wrangler's default of `127.0.0.1` would only be reachable from inside the container; binding to all interfaces makes the host port-forward work

Bare-metal `npx wrangler dev` is documented for reference but should not be the default. If a future tool (linter, test runner, codegen) needs to be added, propose a Docker-based recipe first; only fall back to a host install if the user explicitly opts in for that tool.

**Unit tests** (currently just `chains.js` detection) run under the same Docker pattern — no port forward needed, no wrangler:

```bash
docker run --rm -v "$(pwd):/app" -w /app node:lts npm test
```

`npm test` runs `node --test 'test/**/*.test.mjs'` (Node's built-in test runner — no Jest/Vitest dependency). Add new chains to `test/fixtures/addresses.json` and the parametrized test in `test/detect-chain.test.mjs` will pick them up automatically.

Smoke-test the proxies from the host while the container runs — `curl` is a host-side tool so no container needed. Same payloads as the production smoke tests in the Deployment section, just against `http://localhost:8787`:

Smoke-test the proxies locally once `wrangler dev` is up — same payloads as the production smoke tests in the Deployment section, just against `http://localhost:8787`:

```bash
curl -sX POST http://localhost:8787/api/solana \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getBalance","params":["So11111111111111111111111111111111111111112"]}'

curl -s 'http://localhost:8787/api/evm/1?module=account&action=balance&address=0xd8dA6BF26964aF9D7eeD9e03E53415D37aA96045'
```

## Stack

Quick file map (each file's role at a glance — details in the bullets below):

| File | Role |
|------|------|
| `index.html` | SPA shell; DOM IDs consumed by `app.js`; pinned-SRI `<script>` tags for html2canvas + jsPDF |
| `chains.js` | Pure data + pure logic: `CHAINS` registry + `detectChain()`. ES module, no DOM/fetch — imported by both `app.js` (browser) and `test/*.test.mjs` (Node). |
| `app.js` | Browser-only chain logic: `lookupChain`, `api*` fetchers, `render*` writers, portfolio + CSV/PDF export. Imports `CHAINS` / `detectChain` from `chains.js`. |
| `style.css` | Dark-theme styles; `--accent` swapped per chain |
| `worker.js` | Worker entry; `/api/solana` + `/api/evm/{chainId}` proxies, else `ASSETS` binding |
| `wrangler.jsonc` | Workers config: `main: worker.js`, `assets.directory: "."`, `assets.binding: ASSETS` |
| `_headers` | Static security headers (Pages-style glob, still honored by Static Assets) |
| `package.json` | `type: module` + `npm test` runs `node --test 'test/**/*.test.mjs'`. No runtime deps. |
| `test/` | Node `node:test` unit tests against `chains.js`; address fixtures in `test/fixtures/addresses.json`. |
| `.claude/memory/` | Auto-memory for Claude Code, symlinked from `~/.claude/projects/...` |


- `index.html` — single-page app shell; all DOM element IDs referenced by `app.js`
- `style.css` — dark-theme styles; `--accent` CSS variable overridden per chain via JS
- `chains.js` — pure ES module holding the `CHAINS` registry and `detectChain()`. No browser globals so the file is importable by Node tests. **Always edit chain metadata or detection regexes here, not in `app.js`.**
- `app.js` — browser-only logic: API fetchers, rendering, event wiring. Imports from `./chains.js`.
- `worker.js` — Worker entry (`main`): routes `/api/solana` to the RPC proxy and `/api/evm/{chainId}` to the Routescan proxy, delegates everything else to the `ASSETS` binding (static files)
- `_headers` — security headers. Uses Cloudflare Pages-style `/*` path-glob syntax (pre-dates the Workers migration). It still works under Workers Static Assets today, but if you add a Content-Security-Policy or other path-scoped rules, test that the glob actually matches in this deployment mode.
- `wrangler.jsonc` — Cloudflare Workers config; `main: worker.js`, `assets.directory: "."`, `assets.binding: ASSETS`
- `package.json` — declares `type: module` (so `app.js` can `import` from `chains.js` over `file://` and so `.mjs` tests can re-import it under Node) and the `test` script. Intentionally has no dependencies — the frontend stays buildless.

> **Deployment is Cloudflare Workers Static Assets, not Pages.** The Pages-only `functions/` directory convention does NOT work here — dynamic routes must live in `worker.js` behind the `ASSETS` binding.

> **`assets.directory: "."` ships the entire repo root as static files.** Anything you drop in the root is publicly served at `https://kiwipit.dreudris.com/<name>`. There is no build step or `dist/` filter — `CLAUDE.md`, `README.md`, and `wrangler.jsonc` happen to be harmless, but never put secrets, large binaries, or scratch files in the root. New tooling output belongs in a gitignored subdirectory (or a sibling repo), not at the root.

## Code flow

```
chains.js: CHAINS registry + detectChain(input)
   ↓ (imported by app.js)
app.js: EVM_RPCS, handleLookup()       — debounced 150 ms on keystroke; fetches prices, resolves EVM tab
   ↓
lookupChain(input, chainKey)            — dispatches to the right API fetcher, then renders
   ↓
api*() fetchers                         — one per API family (BTC, EVM RPC, Blockchair, TRX, XRP, SOL)
   ↓
render*() functions                     — write directly into DOM elements by ID
```

`lookupChain` (in `app.js`) is the integration point: it decides which fetcher to call based on `chainKey` (or `c.evmKey` / `c.blockchairKey` presence), then calls the matching `render*` functions. `chains.js` deliberately has no DOM or `fetch` references so the same module loads cleanly under Node for tests.

## Supported chains

| Chain | Detection pattern | API | TX list? |
|-------|------------------|-----|---------|
| Bitcoin (BTC) | `1…` `3…` `bc1…` `xpub/ypub/zpub` | mempool.space | ✓ full |
| Ethereum (ETH) | `0x…` + network tab | Routescan (chain 1) | ✓ full |
| BNB Chain | `0x…` + network tab | Routescan (chain 56) | ✓ full |
| Polygon | `0x…` + network tab | Routescan (chain 137) | ✓ full |
| Avalanche | `0x…` + network tab | Routescan (chain 43114) | ✓ full |
| Arbitrum | `0x…` + network tab | Routescan (chain 42161) | ✓ full |
| Optimism | `0x…` + network tab | Routescan (chain 10) | ✓ full |
| Litecoin (LTC) | `L…` `M…` `ltc1…` | blockchair | ✓ full (10 txs) |
| Dogecoin (DOGE) | `D…` | blockchair | ✓ full (10 txs) |
| Bitcoin Cash (BCH) | `q…` `p…` cashaddr | blockchair | ✓ full (10 txs) |
| Dash (DASH) | `X…` | blockchair | ✓ full (10 txs) |
| Tron (TRX) | `T…` | TronGrid | ✓ full (20 txs) |
| XRP | `r…` | XRPL cluster | ✓ full (20 txs) |
| Solana (SOL) | base58 32-44 chars | Solana public RPC | ✓ full (50 sigs, 10 with amounts) |

All APIs are free, no API key required. CoinGecko provides USD prices for all chains in one batch request (failure is silent).

## Adding a new chain

1. In **`chains.js`**: add an entry to `CHAINS` with `name`, `symbol`, `color`, `icon`, `decimals`, `cgId`, `explorer`.
2. In **`chains.js`**: add a regex branch in `detectChain()` — order matters; Solana's broad base58 pattern must stay last.
3. In **`test/fixtures/addresses.json`**: add a known good address for the new chain and run `npm test` (see Local development for the Docker recipe) to lock in the detection.
4. In **`app.js`**: write an `api*()` fetcher function.
5. In **`app.js`**: add a branch in `lookupChain()` calling the fetcher and the appropriate `render*()` function.
   - If it fits an existing API family (EVM RPC → add `evmKey`; Blockchair → add `blockchairKey`), no new fetcher needed.
6. Update the hint text in `index.html` and the footer attribution if using a new data source.

## Key design decisions

- **`--accent` CSS variable** is set per-chain on `<html>` so all accent colors (balance, hover states, spinner) automatically match the selected chain.
- **EVM address ambiguity**: a `0x` address works on all EVM networks; the app shows a network-selector tab row when one is detected. Active selection is tracked in `activeEvmChain`.
- **EVM RPC fallback chain**: `apiEvmBalance` iterates `EVM_RPCS[evmKey]` until one succeeds (kept as dead code; `apiEvmFull` via Routescan is the live path).
- **EVM tx list (proxied)**: `apiEvmFull` calls the same-origin `/api/evm/{chainId}` proxy, which forwards to Routescan's Etherscan-compat API (`api.routescan.io/v2/network/mainnet/evm/{chainId}/etherscan/api`). Direct browser calls to Routescan fail with `Load failed` on iOS WebKit (every browser on iOS, including Chrome/Brave/Edge, uses WebKit per Apple policy) and are blocked by some shields/firewalls. Each EVM chain in `CHAINS` has a `routescanId`. Routescan's free endpoint only supports chains 1 (ETH) and 43114 (AVAX) today — the other EVM chains return `chain not supported` and need an alternate upstream if/when they're re-enabled.
- **EVM balance/value precision**: wei strings converted via `BigInt` to avoid float overflow: `Math.round(Number(wei / 1000n) / 1e15 * 10^decimals)`.
- **Blockchair tx list**: `apiBlockchair` fetches the address dashboard (returns up to 100 tx hashes), then batch-fetches the first 10 via `/dashboards/transactions/{hashes}`; `renderBlockchairTxs` computes net +/− from `inputs[].recipient` / `outputs[].recipient` like Bitcoin.
- **Solana needs a server-side proxy**: every free public Solana RPC fails from a browser — `api.mainnet-beta.solana.com` returns HTTP 403 to browser requests, `solana.publicnode.com` silently returns `[]` for `getSignaturesForAddress` (no history index), and ankr/drpc/etc. require API keys. So `worker.js` exposes `/api/solana`, which whitelists `getBalance`/`getSignaturesForAddress`/`getTransaction` and forwards server-side. **Upstream order matters**: `leorpc.com?api_key=FREE` is primary (keyless, indexes history, accepts datacenter IPs); `mainnet-beta` is the fallback but also blocks Cloudflare's egress IPs ("Your IP or provider is blocked"), so it's last-resort only. The worker iterates `SOLANA_UPSTREAMS` and only accepts an HTTP 200 with no JSON-RPC `error` field (some RPCs return 200 with an "IP blocked" error payload). On the client side, `SOL_RPCS` lists `/api/solana` first, then `publicnode` as a balance-only fallback. `getSignaturesForAddress` is called sequentially after `getBalance` so an error triggers fallback to the next endpoint; `getTransaction` calls (up to 10 in parallel) catch individually and fall back to `—` amounts.
- **Tron direction**: TronGrid returns hex addresses (`41…`) on `acct.address`; `renderTrxTxs` compares `owner_address`/`to_address` against this hex value to determine send/receive.

## Deployment

Cloudflare Workers auto-deploys on every push to `main` (Workers Builds connected to the repo). The live Worker is named **`kiwipit`** and serves the custom domain `kiwipit.dreudris.com` — both declared in `wrangler.jsonc` (`name` + `routes`). The root `dreudris.com` is intentionally unused. An older Worker named `dreudris` previously served this repo; it has been retired (Git build connection removed, custom domain released) and left dormant rather than deleted — Cloudflare has no literal "pause", so a Worker with no triggers is the equivalent.

> **Migration note (delete once verified):** the `dreudris` → `kiwipit` rename is a dashboard operation, not a config edit. If `https://kiwipit.dreudris.com` is not yet served by a Worker named `kiwipit`, the dashboard steps below haven't been completed yet: (1) on the old `dreudris` Worker, disconnect Workers Builds and remove the `kiwipit.dreudris.com` custom domain; (2) Workers & Pages → Create → Connect to Git → this repo, named `kiwipit`. Order matters — release the subdomain from `dreudris` first, or the new Worker's first deploy fails with a domain conflict (a custom domain binds to exactly one Worker).

> **Renaming the Worker requires dashboard work, not just a config edit.** Workers Builds is bound to a specific Worker by its dashboard connection — editing `name:` in `wrangler.jsonc` alone has no effect; the deploy keeps landing on the original Worker. To actually rename: in the dashboard, disconnect Workers Builds from the existing Worker (Settings → Builds), then **Workers & Pages → Create → Connect to Git** with the new name, which provisions a fresh Worker. Move custom domains (e.g. `kiwipit.dreudris.com`) separately via Settings → Domains & Routes — they don't follow the rename, and releasing the domain from the old Worker first is required or the new Worker's deploy hits a domain conflict. Delete (or leave dormant) the old Worker once verified.

After deploy, smoke-test both proxies:

```bash
# Solana — Wrapped SOL mint, always has a non-zero rent-exempt balance
curl -sX POST https://kiwipit.dreudris.com/api/solana \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getBalance","params":["So11111111111111111111111111111111111111112"]}'

# EVM — Vitalik's address on Ethereum mainnet, always present
curl -s 'https://kiwipit.dreudris.com/api/evm/1?module=account&action=balance&address=0xd8dA6BF26964aF9D7eeD9e03E53415D37aA96045'
```

Expect Solana: `{"jsonrpc":"2.0","result":{"context":{...},"value":<lamports>},"id":1}` — not a 404 (route missing), not `{"error":"All Solana upstreams failed"}` (every upstream rejected the worker's egress IP).

Expect EVM: `{"status":"1","message":"OK","result":"<wei>"}` — not `{"status":"0","message":"chain not allowed"}` (chainId off the whitelist) or `{"status":"0","message":"proxy error: ..."}` (upstream fetch failed).

## Adding a new project on a subdomain of dreudris.com

Each new GitHub repo gets its own subdomain (`<project>.dreudris.com`) and its own Cloudflare Worker, named to match the subdomain (e.g. Worker `kiwipit` ↔ `kiwipit.dreudris.com`). The bare root `dreudris.com` is intentionally left unattached — the owner uses subdomains only. (If you ever did want to serve something at the root, you'd move that custom domain onto a Worker in the dashboard: Settings → Domains & Routes.)

### Steps for a new project

1. **In the Cloudflare dashboard:** Workers & Pages → Create → Connect to Git → select the new repo. Give the Worker a name (e.g. `myproject`). Complete the wizard — Cloudflare provisions the Worker and wires up auto-deploy from `main`.

2. **In the new repo's `wrangler.jsonc`:** add the subdomain as a custom domain:
   ```jsonc
   "routes": [
     { "pattern": "myproject.dreudris.com", "custom_domain": true }
   ]
   ```
   The `custom_domain: true` flag is what tells Cloudflare "create the DNS record for me and make the Worker the origin" — without it Cloudflare would look for an existing DNS record and fail.

3. **Commit and push to `main`.** Workers Builds runs `wrangler deploy`, which reads the `routes` entry and provisions the DNS record + TLS certificate automatically.

4. **Wait ~2 minutes**, then open `https://myproject.dreudris.com` in a browser. If it doesn't load immediately, wait a bit longer — DNS propagation and cert issuance can take a few minutes. A new subdomain that was just created is especially prone to local DNS caching: your browser/OS caches the "not found" answer. If in doubt, test from a different network (e.g. mobile data) where no negative cache exists.

### What not to use

- `"custom_domains": [{ "hostname": "..." }]` — this top-level key does **not** exist in the wrangler schema; Cloudflare silently ignores it. The correct key is `"routes"` with `"custom_domain": true` on each entry.

### Current subdomain map

| Subdomain | Worker | Repo |
|-----------|--------|------|
| `kiwipit.dreudris.com` | `kiwipit` | dreudris/kiwipit |

The bare root `dreudris.com` is intentionally unattached — the owner deploys each project only to its own `<project>.dreudris.com` subdomain. The legacy `dreudris` Worker is retired/dormant (no Git connection, no routes).

Update this table when new projects are added.

## Claude memory in this repo

Claude Code's auto-memory files live in this repo at `.claude/memory/` (versioned in git, indexed by `.claude/memory/MEMORY.md`). The Claude Code harness auto-loads memory from `~/.claude/projects/-home-<user>-kiwipit/memory/`, so on each clone the user creates a symlink:

```bash
ln -s "$(pwd)/.claude/memory" ~/.claude/projects/-home-$USER-kiwipit/memory
```

Without the symlink, memory still exists in the repo but won't auto-load — future Claude sessions would have to read it manually from `.claude/memory/MEMORY.md`. The local permission allowlist (`.claude/settings.local.json`) stays per-machine and is git-ignored.

## Git push auth

The `origin` remote uses HTTPS and the user's PAT is stored via `git config --global credential.helper store` at `~/.git-credentials`. **Push directly with `git push origin main` — do not prompt the user for credentials.** If a push ever fails with an auth error, tell the user the stored token may have expired or been revoked; don't try to work around it.

## Portfolio expansion

All five planned phases shipped (currency switcher, multi-wallet inputs, portfolio summary + pie chart, CSV export, PDF export) — see `git log` for the original phased commits. Key pieces in `app.js`:

- **`renderPortfolio(walletResults, exportRows)`** — aggregates balances by `c.cgId` (so ETH on mainnet/Arbitrum/Optimism collapse into one slice), renders the inline SVG pie, and injects the CSV/PDF export buttons into its header row.
- **`normalizeTxs(chainKey, rawTxs, addr, opts)`** — flattens each chain's raw tx shape into uniform rows for CSV. Note: direction/amount logic is also computed inline in each `render*Txs` function (intentional duplication — refactoring six render paths to share the normalized output was deemed riskier than the ~15 lines per chain of duplication).
- **`downloadPdf(btn)`** — captures `#portfolio` and each `.wallet-card` separately with html2canvas, stacks the canvases into an A4 PDF via jsPDF with auto-pagination. Per-element capture (vs. one parent capture) gives clean page breaks.

The PDF libs (`html2canvas` 1.4.1 + `jsPDF` 2.5.1) load from cdnjs with SRI hashes pinned in `index.html`. If you bump versions, regenerate the SRI hashes — the browser will refuse to execute the script otherwise (silent failure: `window.html2canvas` / `window.jspdf` undefined, `downloadPdf` shows an alert).

## Stocks / ETF holdings (planned, not yet shipped)

User wants to track stocks and ETFs alongside the crypto wallets, identified by **ISIN** and a user-entered quantity. As of 2026-06-01 the spec below is agreed but **no code has shipped** — pick this section up when the user says "let's start Phase 1" (or similar) and resume from there.

### Decisions already made (don't relitigate without asking)

- **Identifier is ISIN, not ticker.** ISIN is globally unique; tickers are exchange-scoped (e.g. Roche has different tickers in Zurich vs. OTC). User explicitly asked for ISIN input.
- **Price source: Yahoo Finance** (unofficial endpoints, no signup, no key). Accepted tradeoff: Yahoo restructures its internal API every 6–18 months and the route will break silently until patched. Options weighed and rejected: Finnhub (needs user signup + key the user didn't want to manage), Alpha Vantage (5 req/min cap too tight), manual price entry (rejected as too painful for a portfolio tool).
- **Worker proxy is mandatory.** Yahoo doesn't set CORS headers, so direct browser fetches fail. All Yahoo traffic goes through a new `/api/stock` route in `worker.js` — same pattern as `/api/solana` and `/api/evm/`. Consistent with the [[project-ios-webkit-proxy]] memory: default new third-party fetches behind a worker proxy.
- **Holdings persist via `localStorage`** (same model as the wallet list — check the existing wallet code for the exact key/shape convention). No account system; the user shelved that decision earlier this session.
- **Fiat↔fiat FX in Phase 3 via `exchangerate.host`** (free, no key). Needed so a USD-priced stock can show its EUR-equivalent value when portfolio currency is EUR.

### Yahoo endpoints to call (in `worker.js`)

1. **ISIN → symbol:** `GET https://query1.finance.yahoo.com/v1/finance/search?q={isin}`. Response shape: `{ quotes: [{ symbol, longname, exchange, ... }, ...] }`. Take `quotes[0]`. Empty array → return clean "not found" to the browser.
2. **Symbol → price:** `GET https://query1.finance.yahoo.com/v8/finance/chart/{symbol}`. Response shape: `{ chart: { result: [{ meta: { regularMarketPrice, currency, longName, ... } }] } }`. Read `meta.regularMarketPrice` + `meta.currency`.

**Do NOT use `/v7/finance/quote`** — it requires a `crumb` + cookie auth flow that's painful to replicate from a Worker. The `/v8/finance/chart/` endpoint is the stable choice today.

### Phase 1 — `/api/stock` proxy (backend only, no UI)

- Add `/api/stock?isin={isin}` to `worker.js`. Chain search → chart server-side.
- Return `{ symbol, name, price, currency }` on success; `{ error: "not found" }` when Yahoo's search returns an empty `quotes` array; `{ error: "yahoo error: …" }` when an upstream fetch fails.
- Add a curl smoke test alongside the existing Solana/EVM ones in both the Local development section and the Deployment section. Known-good ISIN to use: `US0378331005` (Apple).
- No frontend changes in this phase. The goal is to confirm the ISIN→price round-trip works on prod before touching `app.js` / `index.html`.

### Phase 2 — Holdings input + per-holding cards (frontend)

- Extend `index.html` with an "Add holding" section: rows of (ISIN input, quantity input, delete button) and a "+ Add holding" button — mirror the existing wallet-list pattern in the same `.search-box` container.
- Persist the holdings array in `localStorage` under a `pitfolio.holdings` key (or match whatever key the wallet list uses; check first).
- On "Look up all", call `/api/stock` once per holding **in parallel** (Promise.all), same way `lookupChain` is called for each wallet.
- Render one card per holding: symbol, name, quantity, price, value. Visually consistent with `.wallet-card` — consider reusing the class so styling stays in sync.
- No pie-chart integration in this phase. Holdings just appear as standalone cards.

### Phase 3 — Portfolio aggregation + FX + exports

- Include holdings in `renderPortfolio()` pie slices. **Open question:** aggregation key — by `symbol`, by ISIN, or by `name`? Two listings of the same security at different ISINs are rare but real; ask the user when starting Phase 3.
- Add fiat↔fiat conversion via `exchangerate.host` so stock values display in the active portfolio currency (USD/EUR/BRL). Fetch the rates table once at lookup time, cache for the page load.
- Update CSV export: holdings have no transactions, so emit one snapshot row per holding (ISIN, symbol, quantity, price, currency, value-in-portfolio-currency, timestamp).
- Update PDF export: include each holding card in the `html2canvas` capture set, same way wallet cards are captured today.
- Update tagline in `index.html` (currently "Multi-Chain Crypto Wallet Viewer") and the title in `<head>` to reflect that the app is no longer crypto-only. Suggested: "Crypto + Stocks Portfolio" — confirm with user.

### Caveats to flag to the user before Phase 1

- **ISIN coverage gaps.** Yahoo's database is incomplete for small European ETFs and very fresh listings. Some valid ISINs will return "not found" — surface that as a clean error on the holding row, not a silent failure.
- **Multi-exchange ambiguity.** A single ISIN can map to multiple Yahoo symbols (ADR vs. primary listing). Phase 1 takes `quotes[0]`. If the user notices wrong-currency hits in Phase 2, add a per-holding "exchange override" field.
- **Yahoo breakage risk.** The `/api/stock` route is the one piece of Pitfolio that can silently stop working through no fault of ours. Open question whether to add a worker-side health endpoint or just rely on the user noticing — settle this if/when it actually breaks.
