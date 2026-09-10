---
# GH agentic workflow frontmatter docs:
# https://github.github.com/gh-aw/reference/frontmatter-full/#complete-frontmatter-reference
# Triggered when the "copilot" label is added to an issue.
# Only runs for users with write access (admin, maintainer, write roles).
# Generate workflow file using `gh aw compile`
on:
  issues:
    types: [labeled]
  roles: [admin, maintainer, write]
  permissions:
    contents: read

if: github.event.label.name == 'copilot'

engine:
  id: copilot
  model: gpt-5.5

permissions:
  issues: read
  contents: read
  pull-requests: read
  copilot-requests: write

safe-outputs:
  assign-to-agent:
    name: copilot
    target: triggering
    model: gpt-5.5
    github-token: ${{ secrets.GH_AW_AGENT_TOKEN }}
---

Assign the GitHub Copilot coding agent to this issue. The agent will read the issue, implement a solution, and open a pull request for review.
