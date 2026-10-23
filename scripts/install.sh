#!/usr/bin/env bash
# Installs PinFriends into a local Vencord clone, then builds (and optionally injects) Vencord.
# Linux / macOS. For Windows use scripts/install.ps1.
#
# Usage: scripts/install.sh [--vencord-path DIR] [--update] [--no-inject]
#   --vencord-path DIR  Vencord clone to use (default: ./Vencord, cloned if missing)
#   --update            git pull the Vencord clone before building
#   --no-inject         build only, do not patch Discord

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENCORD_PATH="$ROOT/Vencord"
UPDATE=0
INJECT=1

while [[ $# -gt 0 ]]; do
    case "$1" in
        --vencord-path) VENCORD_PATH="${2:?--vencord-path needs a value}"; shift 2 ;;
        --update) UPDATE=1; shift ;;
        --no-inject) INJECT=0; shift ;;
        -h|--help) sed -n '2,10p' "${BASH_SOURCE[0]}"; exit 0 ;;
        *) echo "Unknown option: $1 (try --help)" >&2; exit 1 ;;
    esac
done

need() {
    command -v "$1" >/dev/null 2>&1 || { echo "Missing '$1'. $2" >&2; exit 1; }
}

need git "Install Git first."
need node "Install Node.js 22 or newer: https://nodejs.org"
need pnpm "Install it with: npm install -g pnpm (or: corepack enable)"

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if (( NODE_MAJOR < 22 )); then
    echo "Node.js 22 or newer is required (found $(node -v))." >&2
    exit 1
fi

if [[ ! -d "$VENCORD_PATH" ]]; then
    echo "==> Cloning Vencord into $VENCORD_PATH"
    git clone https://github.com/Vendicated/Vencord.git "$VENCORD_PATH"
elif (( UPDATE )); then
    echo "==> Updating Vencord"
    git -C "$VENCORD_PATH" pull --ff-only
fi

[[ -f "$VENCORD_PATH/package.json" ]] || {
    echo "No package.json in '$VENCORD_PATH': not a Vencord clone." >&2
    exit 1
}

DEST="$VENCORD_PATH/src/userplugins/pinFriends"
echo "==> Copying plugin to $DEST"
rm -rf "$DEST"
mkdir -p "$DEST"
cp -R "$ROOT/src/pinFriends/." "$DEST/"

cd "$VENCORD_PATH"

echo "==> Installing dependencies"
pnpm install --frozen-lockfile

echo "==> Building"
pnpm build

if (( INJECT )); then
    echo "==> Injecting into Discord (quit Discord first, or it will keep running old code)"
    pnpm inject
else
    echo "==> Skipping inject (--no-inject). Run 'pnpm inject' in $VENCORD_PATH when ready."
fi

echo "Done. Restart Discord, then enable PinFriends in Settings > Vencord > Plugins."
