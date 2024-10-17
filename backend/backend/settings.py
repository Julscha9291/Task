"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 4.2.5.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

from pathlib import Path
from datetime import timedelta
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-4p7ageb$mf1q1!i_^28k59)x%-87e==k^06+zq4c7=sg-*z=fa'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['127.0.0.1', 
                 'localhost', 
                 '127.0.0.1:62484',
                 'task.julianschaepermeier.com',
                 'julianschaepermeier.com',
                 '85.22.34.217',]


# Application definition

INSTALLED_APPS = [
    'channels',
    "daphne",
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework_simplejwt',
    'corsheaders',
    'rest_framework',
    'tasks', 
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
      'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
  
]

CORS_ORIGIN_ALLOW_ALL = True 

# Channels Settings
ASGI_APPLICATION = 'backend.asgi.application'

# Channels Layer Backend (in-memory channel layer for dev)
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
        'hosts': [('localhost')],
    },
} 


CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000"
]

# For CSRF protection
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000"
]

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

REST_USE_JWT = True

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

ROOT_URLCONF = 'backend.urls'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


# Sitzung auf Datei oder Cache basiert speichern
SESSION_ENGINE = 'django.contrib.sessions.backends.db'  # Standard: Datenbank-basiert

# Sitzungslaufzeit (in Sekunden), standardmäßig wird die Sitzung geschlossen, wenn der Browser geschlossen wird
SESSION_COOKIE_AGE = 1209600  # Zwei Wochen

# Festlegen, dass die Sitzungscookies auch bei einem erneuten Browserstart bestehen bleiben
SESSION_EXPIRE_AT_BROWSER_CLOSE = False

# Sicherstellen, dass die Sitzung nur über HTTPS übertragen wird
SESSION_COOKIE_SECURE = True  # Setze dies auf True, wenn HTTPS verwendet wird


TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, '../frontend/build')],
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

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

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

AUTH_USER_MODEL = 'tasks.CustomUser'

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),  # Setzt die Lebensdauer des Access-Tokens auf 1 Tag
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),  # Setzt die Lebensdauer des Refresh-Tokens auf 30 Tage
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

# Statische Dateien (CSS, JavaScript, Bilder)
STATIC_URL = '/static/'

# Liste zusätzlicher Standorte für statische Dateien
STATICFILES_DIRS = [
    BASE_DIR / 'frontend' / 'build' / 'static',  # Für statische Dateien
]

# Mediendateien (falls benötigt)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')  # Für hochgeladene Dateien

# Für den Zugriff auf Bilder im frontend/build/images
IMAGES_URL = '/images/'
IMAGES_ROOT = BASE_DIR / 'frontend' / 'build' / 'images'

# Absolute filesystem path to the directory that will hold static files.
STATIC_ROOT = BASE_DIR / 'staticfiles'
# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
