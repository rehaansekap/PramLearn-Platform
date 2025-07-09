#!/bin/bash

LOGDIR="log"
LOGFILE="$LOGDIR/reset_and_seed_postgresql_azure.log"

mkdir -p $LOGDIR

echo "===============================================" | tee -a $LOGFILE
echo "Starting Django Reset and Seed Process (PostgreSQL - Azure)" | tee -a $LOGFILE
echo "$(date)" | tee -a $LOGFILE
echo "===============================================" | tee -a $LOGFILE

# Step 1: Hapus semua data di database (tapi struktur tabel tetap)
echo "Step 1: Flushing all data from database..." | tee -a $LOGFILE
python manage.py flush --noinput 2>&1 | tee -a $LOGFILE

# Step 2: Jalankan migrate untuk memastikan struktur tabel sesuai migration
echo "Step 2: Applying migrations..." | tee -a $LOGFILE
python manage.py migrate 2>&1 | tee -a $LOGFILE

# Step 3: (Opsional) Load seed data jika ada fixtures
if [ -f "pramlearnapp/fixtures/initial_data.json" ]; then
    echo "Step 3: Loading seed data..." | tee -a $LOGFILE
    python manage.py loaddata pramlearnapp/fixtures/initial_data.json 2>&1 | tee -a $LOGFILE
fi

echo "===============================================" | tee -a $LOGFILE
echo "Reset and Seed Process Completed Successfully!" | tee -a $LOGFILE
echo "$(date)" | tee -a $LOGFILE
echo "===============================================" | tee -a $LOGFILE