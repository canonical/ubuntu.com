---
# GH agentic workflow frontmatter docs:
# https://github.github.com/gh-aw/reference/frontmatter-full/#complete-frontmatter-reference
# Triggered when the "copilot" label is added to an issue.
# Only runs for users with write access (admin, maintainer, write roles).
# Generate workflow file using `gh aw compile`
description: Assigns the GitHub Copilot coding agent to issues labelled "copilot"
emoji: 🤖
on:
  issues:
    types: [labeled]
  workflow_dispatch:
    inputs:
      issue_number:
        description: 'Issue number to assign Copilot to'
        required: true
        type: number
  roles: [admin, maintainer, write]
  permissions:
    contents: read

if: github.event_name == 'workflow_dispatch' || github.event.label.name == 'copilot'

concurrency:
  job-discriminator: ${{ github.run_id }}

engine:
  id: copilot
  model: gpt-5

permissions:
  contents: read
  copilot-requests: write

# The agent only calls the assign-to-agent safe output, so it needs no GitHub read tools.
tools:
  github: false

safe-outputs:
  assign-to-agent:
    name: copilot
    target: ${{ github.event_name == 'workflow_dispatch' && inputs.issue_number || github.event.issue.number }}
    model: gpt-5
    github-token: ${{ secrets.GH_AW_AGENT_TOKEN }}
---

Assign the GitHub Copilot coding agent to issue #${{ github.event.issue.number || inputs.issue_number }} (https://github.com/${{ github.repository }}/issues/${{ github.event.issue.number || inputs.issue_number }}). The agent will read the issue, implement a solution, and open a pull request for review.
