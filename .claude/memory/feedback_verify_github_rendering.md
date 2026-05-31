---
name: feedback-verify-github-rendering
description: "When verifying that a README change renders on github.com, use curl + grep — WebFetch can't see JS-rendered content"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4b0f6fda-73f7-4fb9-a04c-e72f901d178d
---

To verify that a Mermaid diagram, GFM table, or other JS-enriched content renders correctly on github.com, fetch the raw page HTML with `curl` and grep for the enrichment markers. Do not rely on WebFetch — it doesn't execute JavaScript and reports false negatives.

**Why:** On 2026-05-31, after pushing a README with a Mermaid architecture diagram, WebFetch reported "the Mermaid diagram does not render as SVG ... shows 'Uh oh! There was an error while loading. Please reload this page.'" That made it sound broken. Raw-HTML inspection (`curl https://github.com/dreudris/kiwipit | grep -oE 'data-type="mermaid"|js-render-needs-enrichment|viewscreen.githubusercontent.com'`) confirmed the enrichment wrapper was present and the diagram would render fine in a real browser. The "Uh oh!" string is GitHub's no-JS fallback that WebFetch's HTML→markdown converter scoops up before the client-side enrichment runs.

**How to apply:**
- Mermaid blocks: grep for `data-type="mermaid"` and `viewscreen.githubusercontent.com/markdown/mermaid`. Both present → diagram will render.
- GFM tables: grep for `<table>` in the raw HTML (skipping GitHub's own file-listing table — usually the first match).
- Other enriched content (GeoJSON, 3D models, etc.): grep for `js-render-needs-enrichment` with the appropriate `data-type=`.
- Skip WebFetch entirely for "is it rendering on GitHub" checks. Save the round trip of explaining false negatives to the user.
