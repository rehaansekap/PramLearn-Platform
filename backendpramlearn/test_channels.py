import django
import os

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pramlearn_api.settings')
django.setup()

try:
    import channels
    print(f"✅ Channels version: {channels.__version__}")
    
    from channels.layers import get_channel_layer
    channel_layer = get_channel_layer()
    print(f"✅ Channel layer: {channel_layer}")
    
    from pramlearnapp.consumers import UserStatusConsumer
    print("✅ Consumer imported successfully")
    
    print("🎉 All channels components working!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
except Exception as e:
    print(f"❌ Error: {e}")