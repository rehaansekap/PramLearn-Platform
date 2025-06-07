#!/bin/bash
LOGDIR="log"
LOGFILE="$LOGDIR/reset_and_seed_postgresql_windows.log"

# Buat folder log jika belum ada
mkdir -p $LOGDIR

echo "===============================================" | tee -a $LOGFILE
echo "Starting Django Reset and Seed Process (PostgreSQL - Windows)" | tee -a $LOGFILE
echo "$(date)" | tee -a $LOGFILE
echo "===============================================" | tee -a $LOGFILE

# PostgreSQL connection details
DB_NAME="pramlearn_db"
DB_USER="pramlearn_user"
DB_PASSWORD="123"  # Sesuaikan dengan password Anda
DB_HOST="localhost"
DB_PORT="5432"
POSTGRES_USER="postgres"  # Default postgres superuser

# Check if PostgreSQL is running
echo "Step 0: Checking PostgreSQL service..." | tee -a $LOGFILE
# Untuk Windows, cek service PostgreSQL
powershell -Command "Get-Service -Name 'postgresql*' | Where-Object {$_.Status -eq 'Running'}" | tee -a $LOGFILE

# Drop and create database (Windows style)
echo "Step 1: Dropping and creating PostgreSQL database..." | tee -a $LOGFILE

# Untuk Windows - menggunakan psql langsung
# Pastikan PostgreSQL bin directory ada di PATH
# Atau gunakan full path: "C:\Program Files\PostgreSQL\16\bin\psql.exe"

# Drop database
psql -U $POSTGRES_USER -h $DB_HOST -p $DB_PORT -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>&1 | tee -a $LOGFILE
if [ $? -ne 0 ]; then
    echo "⚠ Drop database failed, database might not exist" | tee -a $LOGFILE
fi

# Create database
psql -U $POSTGRES_USER -h $DB_HOST -p $DB_PORT -c "CREATE DATABASE $DB_NAME;" 2>&1 | tee -a $LOGFILE
if [ $? -eq 0 ]; then
    echo "✓ Database created successfully" | tee -a $LOGFILE
else
    echo "✗ Database creation failed" | tee -a $LOGFILE
    exit 1
fi

# Create user if not exists
echo "Step 1.5: Creating PostgreSQL user..." | tee -a $LOGFILE
psql -U $POSTGRES_USER -h $DB_HOST -p $DB_PORT -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>&1 | tee -a $LOGFILE
if [ $? -ne 0 ]; then
    echo "⚠ User creation failed, user might already exist" | tee -a $LOGFILE
fi

# Grant privileges
psql -U $POSTGRES_USER -h $DB_HOST -p $DB_PORT -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>&1 | tee -a $LOGFILE
psql -U $POSTGRES_USER -h $DB_HOST -p $DB_PORT -c "ALTER USER $DB_USER CREATEDB;" 2>&1 | tee -a $LOGFILE

echo "✓ Database setup completed" | tee -a $LOGFILE

# Remove migration files (keep __init__.py)
echo "Step 2: Removing ALL migration files..." | tee -a $LOGFILE
find pramlearnapp/migrations -name "*.py" -not -name "__init__.py" -delete 2>&1 | tee -a $LOGFILE

# Remove any existing SQLite databases (if applicable)
echo "Step 3: Removing existing SQLite databases..." | tee -a $LOGFILE
rm -rf *.sql *.sqlite3 2>&1 | tee -a $LOGFILE

# Ensure migrations directory exists and has __init__.py
echo "Step 4: Ensuring migrations directory..." | tee -a $LOGFILE
mkdir -p pramlearnapp/migrations
touch pramlearnapp/migrations/__init__.py

# Create new migrations
echo "Step 5: Creating new migrations..." | tee -a $LOGFILE
python manage.py makemigrations pramlearnapp 2>&1 | tee -a $LOGFILE

if [ $? -eq 0 ]; then
    echo "✓ Migrations created successfully" | tee -a $LOGFILE
else
    echo "✗ Migration creation failed" | tee -a $LOGFILE
    exit 1
fi

# Apply migrations
echo "Step 6: Applying migrations..." | tee -a $LOGFILE
python manage.py migrate 2>&1 | tee -a $LOGFILE

if [ $? -eq 0 ]; then
    echo "✓ Migrations applied successfully" | tee -a $LOGFILE
else
    echo "✗ Migration application failed" | tee -a $LOGFILE
    exit 1
fi

# Verify database tables
echo "Step 7: Verifying database tables..." | tee -a $LOGFILE
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pramlearn_api.settings')
django.setup()
from django.db import connection
cursor = connection.cursor()
cursor.execute(\"SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'pramlearnapp_%'\")
tables = cursor.fetchall()
print(f'Found {len(tables)} pramlearnapp tables:')
for table in tables:
    print(f'  - {table[0]}')
if len(tables) == 0:
    print('✗ No pramlearnapp tables found!')
    exit(1)
else:
    print('✓ Database tables created successfully')
" 2>&1 | tee -a $LOGFILE

if [ $? -ne 0 ]; then
    echo "✗ Database verification failed" | tee -a $LOGFILE
    exit 1
fi

# Remove existing initial_data.json before generating new one
echo "Step 8: Removing existing initial_data.json..." | tee -a $LOGFILE
rm -f pramlearnapp/fixtures/initial_data.json 2>&1 | tee -a $LOGFILE

# Generate initial_data.json
echo "Step 9: Generating initial_data.json..." | tee -a $LOGFILE
python generate_initial_data.py 2>&1 | tee -a $LOGFILE

if [ $? -eq 0 ]; then
    echo "✓ Initial data generated successfully" | tee -a $LOGFILE
else
    echo "✗ Initial data generation failed" | tee -a $LOGFILE
    exit 1
fi

# Load fixtures
echo "Step 10: Loading seed data..." | tee -a $LOGFILE
python manage.py loaddata pramlearnapp/fixtures/initial_data.json 2>&1 | tee -a $LOGFILE

if [ $? -eq 0 ]; then
    echo "✓ Seed data loaded successfully" | tee -a $LOGFILE
else
    echo "✗ Seed data loading failed" | tee -a $LOGFILE
    exit 1
fi

# Generate ARCS CSV if the script exists
if [ -f "generate_csv.py" ]; then
    echo "Step 11: Generating ARCS CSV file..." | tee -a $LOGFILE
    python generate_csv.py 2>&1 | tee -a $LOGFILE
    
    if [ $? -eq 0 ]; then
        echo "✓ ARCS CSV generated successfully" | tee -a $LOGFILE
    else
        echo "⚠ ARCS CSV generation failed (non-critical)" | tee -a $LOGFILE
    fi
else
    echo "Step 11: Skipping ARCS CSV generation (generate_csv.py not found)" | tee -a $LOGFILE
fi

# Create superuser with role admin
echo "Step 12: Creating superuser..." | tee -a $LOGFILE
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pramlearn_api.settings')
django.setup()

from pramlearnapp.models import CustomUser, Role

# Check if superuser already exists
if not CustomUser.objects.filter(username='admin').exists():
    try:
        admin_role = Role.objects.get(name='Admin')
        superuser = CustomUser.objects.create_superuser(
            username='admin',
            email='admin@pramlearn.com',
            password='admin123',
            first_name='Super',
            last_name='Admin',
            role=admin_role
        )
        print('✓ Superuser created successfully')
        print('  Username: admin')
        print('  Password: admin123')
        print('  Email: admin@pramlearn.com')
    except Exception as e:
        print(f'✗ Error creating superuser: {e}')
else:
    print('ℹ Superuser already exists, skipping creation')
" 2>&1 | tee -a $LOGFILE

# Final verification
echo "Step 13: Final verification..." | tee -a $LOGFILE
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pramlearn_api.settings')
django.setup()
from pramlearnapp.models import Role, CustomUser, Class, Subject

try:
    roles_count = Role.objects.count()
    users_count = CustomUser.objects.count()
    classes_count = Class.objects.count()
    subjects_count = Subject.objects.count()
    
    print(f'✓ Final verification successful:')
    print(f'  - Roles: {roles_count}')
    print(f'  - Users: {users_count}')
    print(f'  - Classes: {classes_count}')
    print(f'  - Subjects: {subjects_count}')
    
    if roles_count == 0 or users_count == 0:
        print('✗ Critical data missing!')
        exit(1)
        
except Exception as e:
    print(f'✗ Verification failed: {e}')
    exit(1)
" 2>&1 | tee -a $LOGFILE

if [ $? -ne 0 ]; then
    echo "✗ Final verification failed" | tee -a $LOGFILE
    exit 1
fi

echo "===============================================" | tee -a $LOGFILE
echo "Reset and Seed Process Completed Successfully!" | tee -a $LOGFILE
echo "$(date)" | tee -a $LOGFILE
echo "===============================================" | tee -a $LOGFILE
echo ""
echo "🎉 Database setup complete!"
echo "🔑 Superuser credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo "   Email: admin@pramlearn.com"
echo ""
echo "🚀 You can now start the Django server:"
echo "   python manage.py runserver"