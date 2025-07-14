#!/usr/bin/env bash

echo "🚀 Starting Development Server with WebSocket Support..."
echo "Using Uvicorn for ASGI..."

# Fungsi cleanup untuk menangani SIGINT/SIGTERM
cleanup() {
    echo ""
    echo "🛑 Stopping server..."
    pkill -P $$
    exit 0
}

# Trap signals untuk cleanup yang proper
trap cleanup SIGINT SIGTERM

# Jalankan uvicorn (pastikan sudah di dalam virtualenv)
uvicorn pramlearn_api.asgi:application \
  --host 0.0.0.0 \
  --port 8000 \
  --reload \
  --reload-dir . \
  --reload-exclude "*.pyc" \
  --reload-exclude "__pycache__" \
  --reload-exclude ".git" \
  --reload-exclude ".venv" \
  --workers 1 \
  --log-level info \
  --access-log \
  --timeout-keep-alive 5 \
  --timeout-graceful-shutdown 30

wait