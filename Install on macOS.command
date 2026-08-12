#!/bin/sh
set -eu

INSTALLER_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$INSTALLER_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20 or newer is required. Install it from nodejs.org and run this installer again."
  read -r -p "Press Return to close..." _
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
fi

node scripts/install-host.mjs

CHROME_EXTENSIONS_URL="$(sed -n 's/^CHROME_EXTENSIONS_URL=//p' .env | head -n 1)"
open -a "Google Chrome" "$CHROME_EXTENSIONS_URL"

echo
echo "Native host installed successfully."
echo "In Chrome, enable Developer mode, click Load unpacked, and select:"
echo "$INSTALLER_DIR/extension"
echo
read -r -p "Press Return to close..." _
