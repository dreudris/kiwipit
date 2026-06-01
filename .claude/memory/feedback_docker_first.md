---
name: feedback-docker-first
description: Run dev tools and tests in Docker containers, not directly on the host Linux. Curl and git on the host are fine.
metadata:
  type: feedback
---

Do not install language tools (Node, Python, wrangler, linters, test runners, etc.) directly on the host Linux via `apt`, `npm -g`, `pip`, `npx`, or similar. Use a throwaway Docker container instead.

The canonical Pitfolio dev command is:

```bash
docker run --rm -it -v "$(pwd):/app" -w /app -p 8787:8787 node:lts \
  npx wrangler dev --ip 0.0.0.0
```

Host-side tools that are fine to use without a container: `git`, `curl`, file edits, shell scripting. These don't install anything new and are part of any standard Linux.

For any *new* tool that comes up (linter, codegen, test runner, language SDK, etc.), propose a Docker-based recipe first. Only fall back to a host install if the user explicitly opts in for that tool.

**Why:** User wants to keep their Linux clean and tests reproducible/isolated. Stated 2026-05-31.

**How to apply:** Every time a command would install or download a tool to the host. Common triggers: `npm install`, `npx <tool>`, `pip install`, `apt install`, `brew install`, downloading a binary into `~/.local/bin`. Replace with `docker run` of an official image. Tied to [[user-background]] — the owner is learning, and host clutter is harder to undo than a stopped container.
