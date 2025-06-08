from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv
import dj_database_url


load_dotenv()  # Ini akan membaca file .env jika ada

DEBUG = os.getenv("DEBUG", "False") == "True"
SECRET_KEY = os.getenv(
    "SECRET_KEY", "django-insecure-4kh_a6m4m)l@eeg0%3#0#@!m)efo%otu@jp^z2qucjr9pt@y@9")
ALLOWED_HOSTS = [host.strip() for host in os.getenv(
    "ALLOWED_HOSTS", "localhost,127.0.0.1,0.0.0.0").split(",")]

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# SECURITY WARNING: keep the secret key used in production secret!
# SECRET_KEY = 'django-insecure-4kh_a6m4m)l@eeg0%3#0#@!m)efo%otu@jp^z2qucjr9pt@y@9'

# SECURITY WARNING: don't run with debug turned on in production!
# DEBUG = True

# ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'pramlearnapp',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'channels',  # Pastikan ini ada
]

# Channel layers: Redis jika REDIS_URL ada, fallback ke InMemory
if os.getenv('REDIS_URL'):
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                "hosts": [os.getenv('REDIS_URL')],
            },
        },
    }
else:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels.layers.InMemoryChannelLayer',
        },
    }

# Azure Storage (optional, aktifkan jika ingin pakai Azure Storage untuk static/media)
AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
# if AZURE_STORAGE_CONNECTION_STRING and not DEBUG:
#     DEFAULT_FILE_STORAGE = "storages.backends.azure_storage.AzureStorage"
#     STATICFILES_STORAGE = "storages.backends.azure_storage.AzureStorage"

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'pramlearn_api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'pramlearn_api.wsgi.application'
ASGI_APPLICATION = 'pramlearn_api.asgi.application'


# Database
# https://docs.djangoproject.com/en/4.0/ref/settings/#databases
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': 'pramlearn_db',
#         'USER': 'rehanseekap',
#         'PASSWORD': '123123123',  # Ganti dengan password yang Anda buat
#         'HOST': 'localhost',
#         'PORT': '5432',
#     }
# }
if os.getenv("DATABASE_URL"):
    DATABASES = {
        'default': dj_database_url.parse(os.getenv("DATABASE_URL"))
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'pramlearn_db',
            'USER': 'rehanseekap',
            'PASSWORD': '123123123',  # Ganti dengan password lokal Anda
            'HOST': 'localhost',
            'PORT': '5432',
        }
    }


# Password validation
# https://docs.djangoproject.com/en/4.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.0/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/4.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

AUTH_USER_MODEL = 'pramlearnapp.CustomUser'

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
if not DEBUG:
    CORS_ALLOWED_ORIGINS += [
        "https://pramlearn-frontend.azurestaticapps.net",
        "https://www.pramlearn.com",
        "https://pramlearn.com",
        # Tambahkan domain frontend production lain jika ada
    ]

SIMPLE_JWT = {
    # Token akses berlaku selama 5 menit
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=4),
    # Token refresh berlaku selama 1 hari
    'REFRESH_TOKEN_LIFETIME': timedelta(hours=4),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': False,

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',

    'JTI_CLAIM': 'jti',

    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(days=1),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
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
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {name} {levelname}: {message}',
            'style': '{',
            'datefmt': '%d/%b/%Y %H:%M:%S',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
        'django_server': {
            'format': '[{asctime}] {message}',
            'style': '{',
            'datefmt': '%d/%b/%Y:%H:%M:%S',
        },
        'error_detail': {
            'format': '[{asctime}] {name} {levelname}: {message}\n{pathname}:{lineno}',
            'style': '{',
            'datefmt': '%d/%b/%Y %H:%M:%S',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
            'level': 'DEBUG',
        },
        'error_console': {
            'class': 'logging.StreamHandler',
            'formatter': 'error_detail',
            'level': 'ERROR',
        },
        'server_console': {
            'class': 'logging.StreamHandler',
            'formatter': 'django_server',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'error_console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.server': {
            'handlers': ['server_console'],
            'level': 'INFO',
            'propagate': False,
        },
        'daphne': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'channels': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['error_console'],
            'level': 'ERROR',
            'propagate': False,
        },
        'django.urls': {
            'handlers': ['error_console'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}
