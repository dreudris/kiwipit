---
name: project-portfolio-phases
description: Pitfolio portfolio expansion — all 5 phases shipped as of 2026-05-31
metadata: 
  node_type: memory
  type: project
  originSessionId: 4b0f6fda-73f7-4fb9-a04c-e72f901d178d
---

The Pitfolio portfolio expansion roadmap is complete. As of 2026-05-31, all five phases are shipped to `main` and deployed at dreudris.com:

1. **Phase 1 — currency switcher** (USD / EUR / BRL), persisted via localStorage.
2. **Phase 2 — multi-wallet inputs**, parallel lookup with one card per wallet.
3. **Phase 3 — portfolio summary + pie chart**, aggregated by `cgId` (so ETH on mainnet/Arbitrum/Optimism collapse into one slice). Inline SVG pie + legend.
4. **Phase 4 — CSV export** of all transactions across all wallets. `normalizeTxs(chainKey, rawTxs, addr, opts)` flattens each chain's raw tx shape into uniform rows; render functions still compute direction/amount inline (intentional duplication — see CLAUDE.md).
5. **Phase 5 — PDF export** via html2canvas + jsPDF (cdnjs, SRI-pinned). Captures `#portfolio` + each `.wallet-card` separately, A4 portrait with auto-pagination.

**Why:** This was a multi-week incremental feature. The full design rationale and "why each phase looks the way it does" already lives in CLAUDE.md and git history — this memory exists so future-me skips the "is the roadmap still open?" check and goes straight to whatever the new ask is.

**How to apply:** If the user says "add X to the portfolio" or "tweak the export," treat it as new work, not roadmap continuation. There is no Phase 6+ planned. Related: [[feedback-phased-workflow]] for how to ship new feature waves on this project.
