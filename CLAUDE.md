# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**KiwiPit** — a static Bitcoin wallet viewer deployed at [kiwipit.com](https://kiwipit.com) via Cloudflare Pages.

No build step. Pure HTML/CSS/JS — edit and push to deploy.

## Stack

- `index.html` — single-page app shell
- `style.css` — dark-theme styles, CSS variables for colours
- `app.js` — all logic (address/xpub detection, mempool.space API calls, rendering)
- `_headers` — Cloudflare Pages security headers

## APIs used

- **mempool.space** (`https://mempool.space/api`) — balance and transactions; no key required
  - Address: `GET /address/{addr}` and `GET /address/{addr}/txs`
  - xpub:    `GET /v1/xpub/{xpub}` and `GET /v1/xpub/{xpub}/txs`
- **CoinGecko** — BTC/USD spot price; fetched on each lookup, failure is silent (price display simply hides)

## Supported input formats

| Format | Example prefix | Notes |
|--------|---------------|-------|
| P2PKH  | `1`           | Legacy address |
| P2SH   | `3`           | SegWit-wrapped |
| Bech32 | `bc1`         | Native SegWit / Taproot |
| xpub   | `xpub` / `ypub` / `zpub` | HD extended public key |

## Deployment

Cloudflare Pages auto-deploys on every push to `main`.
Custom domain `kiwipit.com` is configured inside the Cloudflare Pages dashboard (DNS is auto-managed since the domain is on Cloudflare).
