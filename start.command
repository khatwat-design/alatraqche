#!/bin/bash

# ============================================================
# الأطرقجي — تشغيل المشروع (Double-click for macOS)
# ============================================================

GOLD='\033[38;5;214m'
BOLD='\033[1m'
NC='\033[0m'
DIM='\033[2m'

cleanup() {
  echo -e "\n${BOLD}جارٍ إيقاف جميع الخوادم...${NC}"
  kill $PID_LARAVEL $PID_QUEUE $PID_DASHBOARD $PID_STOREFRONT 2>/dev/null
  wait $PID_LARAVEL $PID_QUEUE $PID_DASHBOARD $PID_STOREFRONT 2>/dev/null
  echo -e "${BOLD}${GOLD}تم الإيقاف.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${BOLD}${GOLD}"
echo "  ╔══════════════════════════════════════╗"
echo "  ║        الأطرقجي — تشغيل المشروع       ║"
echo "  ╚══════════════════════════════════════╝"
echo -e "${NC}"

# 1. Laravel
echo -e "${BOLD}[1/4]${NC} ${GOLD}Laravel${NC} ← ${DIM}:8000${NC}"
cd "$ROOT_DIR"
php artisan serve --port=8000 &>/dev/null &
PID_LARAVEL=$!

# 2. Queue
echo -e "${BOLD}[2/4]${NC} ${GOLD}Queue Worker${NC}"
php artisan queue:listen --tries=3 --sleep=3 &>/dev/null &
PID_QUEUE=$!

sleep 1

# 3. Dashboard
echo -e "${BOLD}[3/4]${NC} ${GOLD}Dashboard${NC} → ${DIM}:3000${NC}"
cd "$ROOT_DIR/dashboard"
[ ! -d "node_modules/react" ] && npm install &>/dev/null
npm run dev &>/dev/null &
PID_DASHBOARD=$!

# 4. Storefront
echo -e "${BOLD}[4/4]${NC} ${GOLD}Storefront${NC} → ${DIM}:3001${NC}"
cd "$ROOT_DIR/storefront"
[ ! -d "node_modules/react" ] && npm install &>/dev/null
npm run dev &>/dev/null &
PID_STOREFRONT=$!

cd "$ROOT_DIR"

echo ""
echo -e "${BOLD}${GOLD}✓ جميع الخوادم شغالة${NC}"
echo ""
echo -e "  ${GOLD}API${NC}       ${DIM}→${NC}  http://localhost:8000/api/v1"
echo -e "  ${GOLD}Dashboard${NC} ${DIM}→${NC}  http://localhost:3000"
echo -e "  ${GOLD}Storefront${NC}${DIM}→${NC}  http://localhost:3001"
echo ""
echo -e "  ${DIM}Dash Login: admin@alatraqji.local / password${NC}"
echo -e "  ${DIM}لإيقاف: Ctrl+C${NC}"
echo ""

wait
