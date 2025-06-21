from django.apps import AppConfig


class PramlearnappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pramlearnapp'

    def ready(self):
        # Import signals untuk register receivers
        try:
            import pramlearnapp.signals
            print("✅ Signals loaded successfully")
        except ImportError as e:
            print(f"❌ Error loading signals: {e}")
