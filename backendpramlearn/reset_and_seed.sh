#!/bin/bash
LOGDIR="log"
LOGFILE="$LOGDIR/reset_and_seed.log"

# Buat folder log jika belum ada
mkdir -p $LOGDIR

echo "===============================================" | tee -a $LOGFILE
echo "Starting Django Reset and Seed Process" | tee -a $LOGFILE
echo "$(date)" | tee -a $LOGFILE
echo "===============================================" | tee -a $LOGFILE

# Drop the existing database
echo "Step 1: Dropping and creating database..." | tee -a $LOGFILE
mysql -u root -p -e "DROP DATABASE IF EXISTS djangolearn; CREATE DATABASE djangolearn;" 2>&1 | tee -a $LOGFILE

if [ $? -eq 0 ]; then
    echo "✓ Database reset successfully" | tee -a $LOGFILE
else
    echo "✗ Database reset failed" | tee -a $LOGFILE
    exit 1
fi

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

echo "Step 5: Skipping manual migration copy (akan dibuat ulang)..." | tee -a $LOGFILE

# Create new migrations
echo "Step 6: Creating new migrations..." | tee -a $LOGFILE
python manage.py makemigrations pramlearnapp 2>&1 | tee -a $LOGFILE

if [ $? -eq 0 ]; then
    echo "✓ Migrations created successfully" | tee -a $LOGFILE
else
    echo "✗ Migration creation failed" | tee -a $LOGFILE
    exit 1
fi

# Apply migrations
echo "Step 7: Applying migrations..." | tee -a $LOGFILE
python manage.py migrate 2>&1 | tee -a $LOGFILE

if [ $? -eq 0 ]; then
    echo "✓ Migrations applied successfully" | tee -a $LOGFILE
else
    echo "✗ Migration application failed" | tee -a $LOGFILE
    exit 1
fi

# PERBAIKAN: Verifikasi database dengan management command
echo "Step 7.5: Verifying database tables..." | tee -a $LOGFILE
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pramlearn_api.settings')
django.setup()
from django.db import connection
cursor = connection.cursor()
cursor.execute(\"SHOW TABLES LIKE 'pramlearnapp_%'\")
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

# Check if initial_data.json exists and has content
if [ -f "pramlearnapp/fixtures/initial_data.json" ] && [ -s "pramlearnapp/fixtures/initial_data.json" ]; then
    echo "✓ initial_data.json exists and has content" | tee -a $LOGFILE
else
    echo "✗ initial_data.json is missing or empty" | tee -a $LOGFILE
    exit 1
fi

# Load seed data
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

# Create superuser with role admin - PERBAIKAN: menggunakan Python langsung
echo "Step 12: Creating superuser with role admin..." | tee -a $LOGFILE
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pramlearn_api.settings')
django.setup()
from django.contrib.auth import get_user_model
from pramlearnapp.models import Role

User = get_user_model()

try:
    # Check if admin role exists
    admin_role = Role.objects.get(name='Admin')
    
    # Create or get superuser
    user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@pramlearn.com',
            'first_name': 'Super',
            'last_name': 'Admin',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
            'role': admin_role
        }
    )
    
    if created:
        user.set_password('admin123')
        user.save()
        print('✓ Superuser created successfully')
    else:
        user.set_password('admin123')
        user.role = admin_role
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print('✓ Existing superuser updated successfully')
        
except Role.DoesNotExist:
    print('✗ Admin role not found. Please check if roles were created properly.')
except Exception as e:
    print(f'✗ Error creating superuser: {e}')
" 2>&1 | tee -a $LOGFILE

# Create additional test users for easier testing
echo "Step 13: Creating additional test users..." | tee -a $LOGFILE
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pramlearn_api.settings')
django.setup()
from django.contrib.auth import get_user_model
from pramlearnapp.models import Role

User = get_user_model()

try:
    # Create test teacher
    teacher_role = Role.objects.get(name='Teacher')
    teacher, created = User.objects.get_or_create(
        username='teacher_test',
        defaults={
            'email': 'teacher@pramlearn.com',
            'first_name': 'Test',
            'last_name': 'Teacher',
            'is_staff': False,
            'is_superuser': False,
            'is_active': True,
            'role': teacher_role
        }
    )
    if created:
        teacher.set_password('teacher123')
        teacher.save()
        print('✓ Test teacher created successfully')
    else:
        print('✓ Test teacher already exists')
    
    # Create test student
    student_role = Role.objects.get(name='Student')
    student, created = User.objects.get_or_create(
        username='student_test',
        defaults={
            'email': 'student@pramlearn.com',
            'first_name': 'Test',
            'last_name': 'Student',
            'is_staff': False,
            'is_superuser': False,
            'is_active': True,
            'role': student_role
        }
    )
    if created:
        student.set_password('student123')
        student.save()
        print('✓ Test student created successfully')
    else:
        print('✓ Test student already exists')
        
except Exception as e:
    print(f'⚠ Error creating test users: {e}')
" 2>&1 | tee -a $LOGFILE

# Collect static files (for production)
if [ "$1" = "--production" ]; then
    echo "Step 14: Collecting static files..." | tee -a $LOGFILE
    python manage.py collectstatic --noinput 2>&1 | tee -a $LOGFILE
    
    if [ $? -eq 0 ]; then
        echo "✓ Static files collected successfully" | tee -a $LOGFILE
    else
        echo "⚠ Static files collection failed (non-critical)" | tee -a $LOGFILE
    fi
fi

# Final verification
echo "Step 15: Final verification..." | tee -a $LOGFILE
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pramlearn_api.settings')
django.setup()
from pramlearnapp.models import Role, CustomUser, Class, Subject, Material

try:
    roles_count = Role.objects.count()
    users_count = CustomUser.objects.count()
    classes_count = Class.objects.count()
    subjects_count = Subject.objects.count()
    materials_count = Material.objects.count()
    
    print(f'✓ Final verification successful:')
    print(f'  - Roles: {roles_count}')
    print(f'  - Users: {users_count}')
    print(f'  - Classes: {classes_count}')
    print(f'  - Subjects: {subjects_count}')
    print(f'  - Materials: {materials_count}')
    
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
echo "Reset and seed completed successfully!" | tee -a $LOGFILE
echo "$(date)" | tee -a $LOGFILE
echo "===============================================" | tee -a $LOGFILE

echo ""
echo "🎉 Database reset and seeding completed successfully!"
echo ""
echo "📊 Summary:"
echo "- Database: djangolearn (reset and recreated)"
echo "- Migrations: Applied successfully"
echo "- Seed data: Loaded successfully"
echo "- Superuser: admin / admin123"
echo "- Test teacher: teacher_test / teacher123"
echo "- Test student: student_test / student123"
echo ""
echo "📝 Log file: $LOGFILE"
echo "🚀 You can now start the development server!"
echo ""