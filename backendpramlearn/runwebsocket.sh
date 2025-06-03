#!/bin/bash

echo "🚀 Starting Development Server with WebSocket Support..."
echo "Using Uvicorn for ASGI..."

# Development mode dengan auto-reload
uvicorn pramlearn_api.asgi:application \
  --host 0.0.0.0 \
  --port 8000 \
  --reload \
  --log-level info \
  --access-log