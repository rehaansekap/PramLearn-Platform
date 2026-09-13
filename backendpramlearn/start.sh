#!/bin/sh
set -e

# Ambil port dari environment variable (Railway menyediakan $PORT), fallback ke 8000
PORT="${PORT:-8000}"

echo "Starting Daphne ASGI server on 0.0.0.0:$PORT with proxy headers..."
exec daphne -b 0.0.0.0 -p "$PORT" --proxy-headers pramlearn_api.asgi:application

