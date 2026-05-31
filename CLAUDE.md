# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**KiwiPit** — a multi-chain crypto wallet viewer deployed at [kiwipit.com](https://kiwipit.com) via Cloudflare Workers (Static Assets + a small Worker for the Solana proxy).

No build step for the frontend. Pure HTML/CSS/JS — edit and push to deploy.

## Local development

```bash
npx wrangler dev   # serves the site at localhost:8787 via wrangler.jsonc
```

No install needed beyond wrangler. Alternatively, any static file server works (`python3 -m http.server`).

## Stack

- `index.html` — single-page app shell; all DOM element IDs referenced by `app.js`
- `style.css` — dark-theme styles; `--accent` CSS variable overridden per chain via JS
- `app.js` — all chain logic: registry, detection, API fetchers, rendering, event wiring
- `worker.js` — Worker entry (`main`): routes `/api/solana` to the RPC proxy and `/api/evm/{chainId}` to the Routescan proxy, delegates everything else to the `ASSETS` binding (static files)
- `_headers` — security headers. Uses Cloudflare Pages-style `/*` path-glob syntax (pre-dates the Workers migration). It still works under Workers Static Assets today, but if you add a Content-Security-Policy or other path-scoped rules, test that the glob actually matches in this deployment mode.
- `wrangler.jsonc` — Cloudflare Workers config; `main: worker.js`, `assets.directory: "."`, `assets.binding: ASSETS`

> **Deployment is Cloudflare Workers Static Assets, not Pages.** The Pages-only `functions/` directory convention does NOT work here — dynamic routes must live in `worker.js` behind the `ASSETS` binding.

## Code flow in `app.js`

```
CHAINS registry + EVM_RPCS
   ↓
detectChain(input)          — regex per address format, 150 ms debounced on keystroke
   ↓
handleLookup()              — fetches prices, resolves EVM tab, calls lookupChain()
   ↓
lookupChain(input, chainKey)— dispatches to the right API fetcher, then renders
   ↓
api*() fetchers             — one per API family (BTC, EVM RPC, Blockchair, TRX, XRP, SOL)
   ↓
render*() functions         — write directly into DOM elements by ID
```

`lookupChain` is the integration point: it decides which fetcher to call based on `chainKey` (or `c.evmKey` / `c.blockchairKey` presence), then calls the matching `render*` functions.

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

1. Add an entry to `CHAINS` with `name`, `symbol`, `color`, `icon`, `decimals`, `cgId`, `explorer`.
2. Add a regex branch in `detectChain()` — order matters; Solana's broad base58 pattern must stay last.
3. Write an `api*()` fetcher function.
4. Add a branch in `lookupChain()` calling the fetcher and the appropriate `render*()` function.
   - If it fits an existing API family (EVM RPC → add `evmKey`; Blockchair → add `blockchairKey`), no new fetcher needed.
5. Update the hint text in `index.html` and the footer attribution if using a new data source.

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

Cloudflare Workers auto-deploys on every push to `main` (Workers Builds connected to the repo). Custom domain `kiwipit.com` is managed in the Cloudflare dashboard.

After deploy, smoke-test both proxies:

```bash
# Solana — Wrapped SOL mint, always has a non-zero rent-exempt balance
curl -sX POST https://kiwipit.com/api/solana \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getBalance","params":["So11111111111111111111111111111111111111112"]}'

# EVM — Vitalik's address on Ethereum mainnet, always present
curl -s 'https://kiwipit.com/api/evm/1?module=account&action=balance&address=0xd8dA6BF26964aF9D7eeD9e03E53415D37aA96045'
```

Expect Solana: `{"jsonrpc":"2.0","result":{"context":{...},"value":<lamports>},"id":1}` — not a 404 (route missing), not `{"error":"All Solana upstreams failed"}` (every upstream rejected the worker's egress IP).

Expect EVM: `{"status":"1","message":"OK","result":"<wei>"}` — not `{"status":"0","message":"chain not allowed"}` (chainId off the whitelist) or `{"status":"0","message":"proxy error: ..."}` (upstream fetch failed).

## Git push auth

The `origin` remote uses HTTPS and the user's PAT is stored via `git config --global credential.helper store` at `~/.git-credentials`. **Push directly with `git push origin main` — do not prompt the user for credentials.** If a push ever fails with an auth error, tell the user the stored token may have expired or been revoked; don't try to work around it.

## Portfolio expansion

All five planned phases shipped (currency switcher, multi-wallet inputs, portfolio summary + pie chart, CSV export, PDF export) — see `git log` for the original phased commits. Key pieces in `app.js`:

- **`renderPortfolio(walletResults, exportRows)`** — aggregates balances by `c.cgId` (so ETH on mainnet/Arbitrum/Optimism collapse into one slice), renders the inline SVG pie, and injects the CSV/PDF export buttons into its header row.
- **`normalizeTxs(chainKey, rawTxs, addr, opts)`** — flattens each chain's raw tx shape into uniform rows for CSV. Note: direction/amount logic is also computed inline in each `render*Txs` function (intentional duplication — refactoring six render paths to share the normalized output was deemed riskier than the ~15 lines per chain of duplication).
- **`downloadPdf(btn)`** — captures `#portfolio` and each `.wallet-card` separately with html2canvas, stacks the canvases into an A4 PDF via jsPDF with auto-pagination. Per-element capture (vs. one parent capture) gives clean page breaks.

The PDF libs (`html2canvas` 1.4.1 + `jsPDF` 2.5.1) load from cdnjs with SRI hashes pinned in `index.html`. If you bump versions, regenerate the SRI hashes — the browser will refuse to execute the script otherwise (silent failure: `window.html2canvas` / `window.jspdf` undefined, `downloadPdf` shows an alert).
