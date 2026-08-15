#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"

# Load .env.local
if [ -f "$DIR/.env.local" ]; then
  set -a
  source "$DIR/.env.local"
  set +a
fi

cd "$DIR/.next/standalone" 2>/dev/null || cd "$DIR"
STORE_API_BASE_URL="${STORE_API_BASE_URL:-http://127.0.0.1:8080/api/v1}" \
  node server.js
