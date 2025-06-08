#!/bin/bash

LOGDIR="log"
LOGFILE="$LOGDIR/reset_and_seed_postgresql_azure.log"

mkdir -p $LOGDIR

echo "===============================================" | tee -a $LOGFILE
echo "Starting Django Reset and Seed Process (PostgreSQL - Azure)" | tee -a $LOGFILE
echo "$(date)" | tee -a $LOGFILE
echo "===============================================" | tee -a $LOGFILE

# Step 1: Remove ALL migration files (keep __init__.py)
echo "Step 1: Removing ALL migration files..." | tee -a $LOGFILE
find pramlearnapp/migrations -name "*.py" -not -name "__init__.py" -delete 2>&1 | tee -a $LOGFILE

# Step 2: Attempt to drop all tables by dropping and recreating schema (if allowed)
echo "Step 2: Dropping all tables (drop schema public)..." | tee -a $LOGFILE
psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" 2>&1 | tee -a $LOGFILE
if [ $? -eq 0 ]; then
    echo "✓ All tables dropped (schema recreated)" | tee -a $LOGFILE
else
    echo "⚠ Could not drop schema (likely due to permission). Will continue with migrations." | tee -a $LOGFILE
fi

# Step 3: Ensure migrations directory exists and has __init__.py
echo "Step 3: Ensuring migrations directory..." | tee -a $LOGFILE
mkdir -p pramlearnapp/migrations
touch pramlearnapp/migrations/__init__.py

# Step 4: Create new migrations
echo "Step 4: Creating new migrations..." | tee -a $LOGFILE
python manage.py makemigrations pramlearnapp 2>&1 | tee -a $LOGFILE

# Step 5: Apply migrations
echo "Step 5: Applying migrations..." | tee -a $LOGFILE
python manage.py migrate 2>&1 | tee -a $LOGFILE

# Step 6: Load fixtures (optional)
if [ -f "pramlearnapp/fixtures/initial_data.json" ]; then
    echo "Step 6: Loading seed data..." | tee -a $LOGFILE
    python manage.py loaddata pramlearnapp/fixtures/initial_data.json 2>&1 | tee -a $LOGFILE
fi

echo "===============================================" | tee -a $LOGFILE
echo "Reset and Seed Process Completed Successfully!" | tee -a $LOGFILE
echo "$(date)" | tee -a $LOGFILE
echo "===============================================" | tee -a $LOGFILE