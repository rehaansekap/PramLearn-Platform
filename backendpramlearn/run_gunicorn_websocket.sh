#!/bin/bash
# filepath: backendpramlearn/run_gunicorn_websocket.sh

LOGDIR="log"
LOGFILE="$LOGDIR/gunicorn_websocket.log"

# Buat folder log jika belum ada
mkdir -p $LOGDIR

echo "===============================================" | tee -a $LOGFILE
echo "Starting Gunicorn with WebSocket Support" | tee -a $LOGFILE
echo "$(date)" | tee -a $LOGFILE
echo "===============================================" | tee -a $LOGFILE

# Gunakan Uvicorn worker untuk ASGI support
gunicorn pramlearn_api.asgi:application \
  --worker-class uvicorn.workers.UvicornWorker \
  --workers 1 \
  --bind 0.0.0.0:8000 \
  --log-level info \
  --access-logfile $LOGFILE \
  --error-logfile $LOGFILE \
  --timeout 120 \
  --keep-alive 2 \
  --max-requests 1000 \
  --max-requests-jitter 50 \
  --preload