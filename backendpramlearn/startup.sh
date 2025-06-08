#!/bin/bash

echo "🚀 Starting Azure Web App Startup Script..."

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🔄 Running migrations..."
python manage.py migrate --noinput

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if not exists (optional)
echo "👤 Creating superuser..."
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pramlearn_api.settings')
django.setup()
from django.contrib.auth import get_user_model

User = get_user_model()

try:
    if not User.objects.filter(username='admin').exists():
        user = User.objects.create_user(
            username='admin',
            email='admin@pramlearn.com',
            password='admin123',
            first_name='Super',
            last_name='Admin',
            is_staff=True,
            is_superuser=True
        )
        print('✓ Superuser created successfully')
    else:
        print('✓ Superuser already exists')
except Exception as e:
    print(f'⚠ Could not create superuser: {e}')
"

echo "🌐 Starting Gunicorn with ASGI support..."
# Start Gunicorn with ASGI for WebSocket support
gunicorn --bind=0.0.0.0:8000 --worker-class uvicorn.workers.UvicornWorker --timeout 600 --workers 1 pramlearn_api.asgi:application

echo "✅ Startup script completedd"