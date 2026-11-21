#!/usr/bin/env bash
# Install the toolchain for developing ubuntu.com in a dev container:
# Taskfile (task runner) and mise (Python/Node.js version manager).
# Project dependencies and static assets are installed separately by
# `updateContentCommand` in devcontainer.json so Codespaces prebuilds cache them.
set -euo pipefail

# Use the same Taskfile version as CI, which pins it in this action.
# Fall back to the latest release rather than blocking container creation.
TASK_ACTION="$(dirname "$0")/../.github/actions/setup-taskfile/action.yml"
TASK_VERSION="$(awk '$1 == "version:" {print $2; exit}' "$TASK_ACTION" 2>/dev/null || true)"
TASK_TAG=""
if [[ -n "$TASK_VERSION" ]]; then
  TASK_TAG="v$TASK_VERSION"
else
  echo "WARNING: could not read the Taskfile version from $TASK_ACTION; installing the latest" >&2
fi

curl -fsSL https://taskfile.dev/install.sh \
  | sudo sh -s -- -b /usr/local/bin ${TASK_TAG:+"$TASK_TAG"}

# Latest mise, matching the `setup-mise` task in taskfile.yaml.
curl -fsSL https://mise.run | sh
export PATH="$HOME/.local/share/mise/shims:$HOME/.local/bin:$PATH"

# devcontainer.json puts the mise shims on PATH for every process; this also
# lets interactive shells pick up mise's hooks.
activate='eval "$($HOME/.local/bin/mise activate bash)"'
grep -qxF "$activate" "$HOME/.bashrc" || echo "$activate" >> "$HOME/.bashrc"

# Node 20 + yarn (used by `task install` for the JS toolchain)
mise use -g node@20
mise exec node@20 -- npm install -g yarn
mise reshim
