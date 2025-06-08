#!/bin/bash
# filepath: backendpramlearn/run_production.sh

LOGDIR="log"
LOGFILE="$LOGDIR/production.log"

# Buat folder log jika belum ada
mkdir -p $LOGDIR

echo "===============================================" | tee -a $LOGFILE
echo "Starting Production Server with WebSocket Support" | tee -a $LOGFILE
echo "$(date)" | tee -a $LOGFILE
echo "===============================================" | tee -a $LOGFILE

# Set environment variables untuk production
export DJANGO_SETTINGS_MODULE=pramlearn_api.settings
# export REDIS_URL=redis://localhost:6379

# Collect static files
echo "📦 Collecting static files..." | tee -a $LOGFILE
python manage.py collectstatic --noinput 2>&1 | tee -a $LOGFILE

# Run migrations
echo "🔄 Running database migrations..." | tee -a $LOGFILE
python manage.py migrate 2>&1 | tee -a $LOGFILE

# Start Gunicorn with Uvicorn worker
echo "🚀 Starting Gunicorn with WebSocket support..." | tee -a $LOGFILE
gunicorn pramlearn_api.asgi:application \
  --worker-class uvicorn.workers.UvicornWorker \
  --workers 2 \
  --bind 0.0.0.0:8000 \
  --log-level info \
  --access-logfile $LOGFILE \
  --error-logfile $LOGFILE \
  --timeout 120 \
  --keep-alive 2 \
  --max-requests 1000 \
  --max-requests-jitter 50 \
  --preload