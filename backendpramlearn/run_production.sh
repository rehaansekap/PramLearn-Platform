#!/bin/bash
# filepath: backendpramlearn/run_production.sh

LOGDIR="log"
LOGFILE="$LOGDIR/production.log"

# Buat folder log jika belum ada
mkdir -p $LOGDIR

echo "===============================================" | tee -a $LOGFILE
echo "Starting Production Server with WebSocket Supportt" | tee -a $LOGFILE
echo "$(date)" | tee -a $LOGFILE
echo "===============================================" | tee -a $LOGFILE

# Set environment variables untuk production
export DJANGO_SETTINGS_MODULE=pramlearn_api.settings

# Collect static files
echo "📦 Collecting static files..." | tee -a $LOGFILE
python manage.py collectstatic --noinput 2>&1 | tee -a $LOGFILE

# Jalankan reset_and_seed_postgresql_production.sh
echo "🔄 Resetting and seeding PostgreSQL database (Azure)..." | tee -a $LOGFILE
chmod +x reset_and_seed_postgresql_production.sh 2>&1 | tee -a $LOGFILE
bash reset_and_seed_postgresql_production.sh 2>&1 | tee -a $LOGFILE

# Jalankan run_gunicorn_websocket.sh
echo "🚀 Menjalankan Gunicorn dengan WebSocket support (via run_gunicorn_websocket.sh)..." | tee -a $LOGFILE
chmod +x run_gunicorn_websocket.sh 2>&1 | tee -a $LOGFILE
bash run_gunicorn_websocket.sh 2>&1 | tee -a $LOGFILE