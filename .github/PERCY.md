# Percy snapshots

This repo runs visual regression tests via [Percy](https://percy.io/). Two workflows orchestrate it:

- `.github/workflows/percy.yml` — PRs from this repo targeting `main`
- `.github/workflows/percy-baseline.yaml` — pushes to `main` (refreshes the baseline that PRs compare against)

PRs from forks don't get Percy runs for now, so that fork code never runs alongside the Percy token.

The shared gate logic lives in `.github/actions/percy-gate/action.yml`.

## When Percy runs

For PRs the `decide` job evaluates, in order:

1. **`run-percy` label present on the PR?** → RUN.
2. **Author is `dependabot[bot]` or `renovate[bot]`?** → SKIP (bots must use the label to opt in).
3. **Diff touches a watched path?** → RUN.
4. **Otherwise** → SKIP.

For pushes to `main` (baseline):

1. **Workflow manually dispatched?** → RUN.
2. **Push diff touches a watched path?** → RUN.
3. **Otherwise** → SKIP.

When the gate decides to skip, the `snapshot` job is skipped but the workflow exits successfully — branch protection (which treats `skipped` as `success` for required checks) is unaffected.

## Watched paths

Defined once in `.github/actions/percy-gate/action.yml`:

- `static/sass/**`
- `static/js/src/**`
- `templates/**`
- `navigation.yaml`
- `secondary-navigation.yaml`
- `snapshots.js`
- `test-links.yaml`
- `package.json`
- `yarn.lock`

To extend the list, edit the `filters:` block in `.github/actions/percy-gate/action.yml`. The change applies to all three workflows automatically.

## How to force a Percy run

### On a PR

Add the `run-percy` label. Adding the label fires a `labeled` event, the gate re-evaluates, and the snapshot job runs.

Reach for this when:

- The PR changes visuals via a path we don't watch (e.g. a Python view that swaps template variables).
- A Renovate or Dependabot PR bumps a visual-affecting dependency (e.g. `vanilla-framework`) and you want a snapshot.
- You want a one-off sanity-check snapshot on any PR.

### On `main` (refresh the baseline manually)

Go to **Actions → Update Percy Baseline → Run workflow**, select `main`, click Run.

Reach for this when:

- A merged PR's change wasn't caught by the path filter and visual drift later surfaces in production.
- You want a fresh baseline before a release.

## Rapid pushes are de-duplicated

PR workflows declare a `concurrency` group with `cancel-in-progress: true`, so pushing several commits in quick succession only completes the latest run — earlier in-flight Percy runs for the same PR are cancelled. The baseline workflow does not cancel itself (every `main` push completes its baseline independently).

## Troubleshooting

**"Percy didn't run on my PR with a CSS change."**
Check the watched-paths list above. If the path is genuinely visual-affecting and not covered, add it to `.github/actions/percy-gate/action.yml`. For a one-off run, add the `run-percy` label.

**"The `Take Percy snapshots` check shows as skipped."**
Expected when the gate decided to skip. The `Decide whether to run Percy` job ran to completion and reported success — branch protection is satisfied.

**"Percy ran on a PR that didn't change visuals."**
Check whether the diff touches any watched path — `package.json` and `yarn.lock` will match any dependency bump. Bots are blocked by default, but a human PR touching these triggers a run.
