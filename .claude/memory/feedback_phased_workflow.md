---
name: feedback-phased-workflow
description: "On KiwiPit, ship multi-feature work as small phases with a verify-on-prod gate between each"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4b0f6fda-73f7-4fb9-a04c-e72f901d178d
---

For multi-feature initiatives on KiwiPit, ship one phase per commit and pause for the user to verify on dreudris.com (auto-deployed by Cloudflare Workers Builds on push to `main`) before starting the next phase. The user signals "go" / "approved" / "worked" between phases.

**Why:** This is the documented workflow in CLAUDE.md and the user followed it consistently across all 5 portfolio phases. Each phase pause caught real issues — Phase 4 surfaced the iOS WebKit "Load failed" bug on Routescan that desktop testing never would have, and the fix landed as its own focused commit between Phases 4 and 5 rather than getting bundled into the next phase. Small phases also keep the diff reviewable on a phone (the user tests on iOS).

**How to apply:** When the user asks for a "feature wave" or anything spec'd as numbered phases, treat each phase as its own atomic ship. Don't pre-implement Phase N+1 while waiting for Phase N approval — the user may want changes based on what they see. Bug fixes that surface during phase verification get their own commits (don't roll them into the next phase). One-off small features can ship as a single commit; this only applies to multi-step expansion work.
