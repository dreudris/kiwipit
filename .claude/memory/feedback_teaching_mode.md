---
name: feedback-teaching-mode
description: "When making changes, briefly explain what and why in plain language and name the JS/web concept involved; repetition is fine."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8f20dd98-fe24-4c9f-b354-67622379a8d2
---

When making non-trivial changes in this repo, add a short plain-language teaching note alongside the normal terse summary: what was changed, why, and the name of the underlying JS/web concept (e.g. event listener, async/await, fetch, DOM ID, BigInt, CSS variable, SRI hash, CORS, JSON-RPC). Keep it to a sentence or two per change — not a lecture.

Re-explaining a concept that came up before is welcome; do not assume prior explanations stuck. Prefer answers that point at the pattern, not just the one-line fix, so the user can spot the same situation next time.

Gloss unavoidable jargon on first use within a response.

The plain-English "how it all works" walkthrough lives in `README.md` — keep it in sync when architecture changes (new chain, new proxy route, new feature).

**Why:** User is new to web/JS ([[user-background]]) and is learning by working on this project; goal is independence from Claude for routine changes.

**How to apply:** Every code change in this repo. Skip only for pure typo fixes, doc edits, or changes the user explicitly says "just do it" on.
