---
name: feedback-gate-commits
description: "On KiwiPit, describe the diff and stop before committing — let the user authorize commit/push explicitly"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4b0f6fda-73f7-4fb9-a04c-e72f901d178d
---

After implementing a change on KiwiPit, describe what changed in a short summary and stop. Do not auto-commit, even when CLAUDE.md's phase workflow lists "implement → commit → push" as a single sequence. The user authorizes with an explicit "commit it" / "push it" / "commit and push" each time.

**Why:** Demonstrated across 5+ separate change cycles in one session (Phase 3 doc cleanup, Phase 4, iOS proxy fix, Phase 5, etc.). Early in the session the user gated commit and push as two separate operations; later they consolidated to "commit and push" once trust was established — but they always typed the authorization explicitly. Auto-committing would have removed their final review step before the diff hits production.

**How to apply:** After an Edit/Write that completes a logical unit of work, write a short summary of the diff (what files changed, what the behavioral effect is, any caveats) and end with "Commit and push?" or similar. Do not run `git commit` until they answer affirmatively. This is project-specific to KiwiPit because deploys are instant (push to `main` → live on dreudris.com via Cloudflare Workers Builds) — there is no PR review step that would otherwise catch problems. Related: [[feedback-phased-workflow]].
