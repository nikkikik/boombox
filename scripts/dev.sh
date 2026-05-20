#!/usr/bin/env bash
# Освобождает порты 3000/3001 и запускает Next.js dev.
# Использование: ./scripts/dev.sh [--clean|-c]

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

for port in 3000 3001; do
  pids=$(lsof -ti :"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "→ Stopping process on port $port"
    kill -9 $pids 2>/dev/null || true
  fi
done

if [[ "${1:-}" == "--clean" || "${1:-}" == "-c" ]]; then
  echo "→ Removing .next cache"
  rm -rf .next
fi

echo "→ Starting dev server at http://localhost:3000"
echo "   (Keep this terminal open. If the page breaks, run: npm run restart)"
exec "$ROOT/node_modules/.bin/next" dev --turbopack
