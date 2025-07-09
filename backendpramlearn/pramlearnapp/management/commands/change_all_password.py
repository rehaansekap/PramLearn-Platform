from pramlearnapp.models import CustomUser
from django.contrib.auth.hashers import make_password

# Bulk update semua user sekaligus
hashed_password = make_password("123")
updated_count = CustomUser.objects.update(password=hashed_password)

print(f"Password berhasil diubah untuk {updated_count} users")
