#!/usr/bin/env bash
# Проверяет, жив ли dev-сервер; если нет — запускает.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if curl -s -o /dev/null -w "" --max-time 2 http://localhost:3000/ 2>/dev/null; then
  echo "✓ Dev server already running → http://localhost:3000"
  exit 0
fi

echo "Dev server is not running. Starting..."
exec bash "$ROOT/scripts/dev.sh"
