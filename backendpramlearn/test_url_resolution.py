# test_url_resolution.py
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pramlearn_api.settings")
django.setup()
from django.urls import reverse, resolve

print(reverse("sessions-arcs-analysis-export"))
print(resolve("/api/teacher/sessions/arcs-analysis/export/"))
