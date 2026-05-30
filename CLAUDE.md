# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**KiwiPit** — a static Bitcoin wallet viewer deployed at [kiwipit.com](https://kiwipit.com) via Cloudflare Pages.

No build step. Pure HTML/CSS/JS — edit and push to deploy.

## Stack

- `index.html` — single-page app shell
- `style.css` — dark-theme styles, `--accent` CSS variable overridden per chain via JS
- `app.js` — multi-chain logic: detection, API fetchers, rendering
- `_headers` — Cloudflare Pages security headers

## Supported chains

| Chain | Detection pattern | API | TX list? |
|-------|------------------|-----|---------|
| Bitcoin (BTC) | `1…` `3…` `bc1…` `xpub/ypub/zpub` | mempool.space | ✓ full |
| Ethereum (ETH) | `0x…` + network tab | public EVM RPC (eth.llamarpc.com) | explorer link |
| BNB Chain | `0x…` + network tab | BSC RPC (bsc-dataseed.binance.org) | explorer link |
| Polygon | `0x…` + network tab | polygon-rpc.com | explorer link |
| Avalanche | `0x…` + network tab | api.avax.network | explorer link |
| Arbitrum | `0x…` + network tab | arb1.arbitrum.io/rpc | explorer link |
| Optimism | `0x…` + network tab | mainnet.optimism.io | explorer link |
| Litecoin (LTC) | `L…` `M…` `ltc1…` | blockchair | explorer link |
| Dogecoin (DOGE) | `D…` | blockchair | explorer link |
| Bitcoin Cash (BCH) | `q…` `p…` cashaddr | blockchair | explorer link |
| Dash (DASH) | `X…` | blockchair | explorer link |
| Tron (TRX) | `T…` | TronGrid | ✓ simplified |
| XRP | `r…` | XRPL cluster | ✓ simplified |
| Solana (SOL) | base58 32-44 chars | Solana public RPC | ✓ signatures |

All APIs are free and require no API key. CoinGecko provides USD prices for all chains in one batch request (failure is silent).

## Key design decisions

- **`--accent` CSS variable** is set per-chain on `<html>` so all orange accents (balance, hover states, spinner) automatically match the selected chain colour.
- **EVM address ambiguity**: a `0x` address works on all EVM networks; the app shows a network-selector tab row when one is detected.
- **`detectChain()`** runs on every keystroke (150 ms debounce) to update the inline chip and show/hide the EVM selector before the user clicks Look up.
- **EVM balance precision**: `eth_getBalance` returns a hex `wei` string; code converts via `BigInt` to avoid float overflow: `Number(wei / 1000n) / 1e15`.

## Deployment

Cloudflare Pages auto-deploys on every push to `main`.
Custom domain `kiwipit.com` is configured inside the Cloudflare Pages dashboard (DNS is auto-managed since the domain is on Cloudflare).
