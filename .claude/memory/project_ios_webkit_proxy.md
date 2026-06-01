---
name: project-ios-webkit-proxy
description: "Pitfolio — default new third-party browser fetches to a worker proxy because iOS WebKit silently fails with \"Load failed\""
metadata: 
  node_type: memory
  type: project
  originSessionId: 4b0f6fda-73f7-4fb9-a04c-e72f901d178d
---

For any new browser → third-party fetch in Pitfolio, ship it behind a same-origin `worker.js` proxy by default. Don't wait for an iOS user to report a failure.

**Why:** On 2026-05-31 the user reported an Ethereum address loading as "Load failed" in red. Direct curl to Routescan was 200/healthy, CORS was wildcard-open, and the lookup worked on desktop. The failure was iOS WebKit-specific — every iOS browser (Chrome, Brave, Edge) uses WebKit under the hood per Apple policy, so they all inherit Safari's opaque cross-origin fetch failures. The fix mirrored the Solana proxy: a `/api/evm/{chainId}` route in `worker.js` whitelisted to `account.balance` / `account.txlist`, with the client switched to same-origin. The string `"Load failed"` itself is the giveaway — desktop Chromium emits `"Failed to fetch"`, Firefox emits `"NetworkError when attempting to fetch resource"`.

**How to apply:**
- New API integrations (new chain, replacement for an existing data source, etc.) → ship behind `/api/{name}` from day one. Cost is tiny (one Worker route, ~30 lines).
- Existing direct fetches that have been working (mempool.space, Blockchair, TronGrid, XRPL, CoinGecko) are Safari-clean today — **don't preemptively migrate them**, only switch to a proxy if reported as broken on iOS.
- The proxy template is in `worker.js`: whitelist the chain/method/action parameters so the route isn't a generic open proxy. See `handleEvm` and `handleSolana`.
- The user tests on iOS — see [[feedback-phased-workflow]] for why verify-on-prod catches these issues that desktop testing misses.
