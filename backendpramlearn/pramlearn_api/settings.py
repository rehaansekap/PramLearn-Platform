from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import os
import dj_database_url

load_dotenv()  # Ini akan membaca file .env jika ada

DEBUG = os.getenv("DEBUG", "False") == "True"
SECRET_KEY = os.getenv(
    "SECRET_KEY", "django-insecure-4kh_a6m4m)l@eeg0%3#0#@!m)efo%otu@jp^z2qucjr9pt@y@9"
)
ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "pramlearn-frontend.azurewebsites.net",
    "pramlearn-backend.azurewebsites.net",
    "api.pramlearn.tech",
    "app.pramlearn.tech",
    "pramlearn.tech",
]

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "pramlearnapp",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "channels",
    "storages",
]

# Azure Blob Storage for media files
if os.getenv("AZURE_STORAGE_CONNECTION_STRING"):
    INSTALLED_APPS.append("storages")
    DEFAULT_FILE_STORAGE = "storages.backends.azure_storage.AzureStorage"
    AZURE_ACCOUNT_NAME = os.getenv("AZURE_ACCOUNT_NAME")
    AZURE_ACCOUNT_KEY = os.getenv("AZURE_ACCOUNT_KEY")
    AZURE_CONTAINER = os.getenv("AZURE_CONTAINER", "media")
    AZURE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    AZURE_CUSTOM_DOMAIN = f"{AZURE_ACCOUNT_NAME}.blob.core.windows.net"
    MEDIA_URL = f"https://{AZURE_CUSTOM_DOMAIN}/{AZURE_CONTAINER}/"
    AZURE_OBJECT_PARAMETERS = {
        "content_disposition": "attachment",
    }
else:
    # Fallback ke local storage
    MEDIA_URL = "/media/"
    MEDIA_ROOT = os.path.join(BASE_DIR, "media")

# Channel layers: Redis jika REDIS_URL ada, fallback ke InMemory
if os.getenv("REDIS_URL"):
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {
                "hosts": [os.getenv("REDIS_URL")],
            },
        },
    }
else:
    CHANNEL_LAYERS = {"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}}

# Azure Storage (optional, aktifkan jika ingin pakai Azure Storage untuk static/media)
AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "pramlearn_api.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "pramlearn_api.wsgi.application"
ASGI_APPLICATION = "pramlearn_api.asgi.application"

# Database
if os.getenv("DATABASE_URL"):
    DATABASES = {"default": dj_database_url.parse(os.getenv("DATABASE_URL"))}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": "pramlearn_db",
            "USER": "postgres",
            "PASSWORD": "123123123",
            "HOST": "localhost",
            "PORT": "5432",
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
}

AUTH_USER_MODEL = "pramlearnapp.CustomUser"

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",  # Tambahkan URL frontend Anda
    "https://pramlearnstorage.z23.web.core.windows.net",
    "https://www.pramlearn.tech",  # Custom domain frontend
    "https://pramlearn.tech",  # Root domain
    "https://api.pramlearn.tech",  # Custom domain backend
    "https://app.pramlearn.tech",
    "http://app.pramlearn.tech",
]

if not DEBUG:
    CORS_ALLOWED_ORIGINS.append("https://pramlearnstorage.z23.web.core.windows.net")

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ORIGIN = True

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=4),
    "REFRESH_TOKEN_LIFETIME": timedelta(hours=4),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": False,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "VERIFYING_KEY": None,
    "AUDIENCE": None,
    "ISSUER": None,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    "JTI_CLAIM": "jti",
    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME": timedelta(days=1),
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=1),
}

# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'handlers': {
#         'console': {
#             'class': 'logging.StreamHandler',
#         },
#     },
#     'root': {
#         'handlers': ['console'],
#         'level': 'DEBUG',
#     },
# }

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{asctime}] {name} {levelname}: {message}",
            "style": "{",
            "datefmt": "%d/%b/%Y %H:%M:%S",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
        "django_server": {
            "format": "[{asctime}] {message}",
            "style": "{",
            "datefmt": "%d/%b/%Y:%H:%M:%S",
        },
        "error_detail": {
            "format": "[{asctime}] {name} {levelname}: {message}\n{pathname}:{lineno}",
            "style": "{",
            "datefmt": "%d/%b/%Y %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
            "level": "DEBUG",
        },
        "error_console": {
            "class": "logging.StreamHandler",
            "formatter": "error_detail",
            "level": "ERROR",
        },
        "server_console": {
            "class": "logging.StreamHandler",
            "formatter": "django_server",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console", "error_console"],
            "level": "INFO",
            "propagate": False,
        },
        "django.server": {
            "handlers": ["server_console"],
            "level": "INFO",
            "propagate": False,
        },
        "daphne": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "channels": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["error_console"],
            "level": "ERROR",
            "propagate": False,
        },
        "django.urls": {
            "handlers": ["error_console"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}

CSRF_TRUSTED_ORIGINS = [
    "https://pramlearn-backend.azurewebsites.net",
    "https://api.pramlearn.tech",  # Custom domain backend
    "https://www.pramlearn.tech",  # Custom domain frontend
    "https://pramlearn.tech",  # Root domain    # Backend API
    "https://app.pramlearn.tech",
    "http://app.pramlearn.tech",
]
