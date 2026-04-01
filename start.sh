#!/bin/bash
# RIKU — Comic Studio Startup Script
# Runs FastAPI backend (port 8000) and Next.js frontend (port 3000)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "============================================"
echo "  RIKU — Comic Studio"
echo "  Starting services..."
echo "============================================"
echo ""

# Start FastAPI backend
echo "[Backend] Starting FastAPI on port 8000..."
cd "$SCRIPT_DIR/backend"
python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Start Next.js frontend
echo "[Frontend] Starting Next.js on port 3000..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop both services."

# Trap Ctrl+C to kill both processes
cleanup() {
  echo ""
  echo "Shutting down..."
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
