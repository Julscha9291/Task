from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from tasks.views import custom_404_view  # Importiere die Ansichten

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('tasks.urls')),  # Registriere deine API-URLs
    path('', TemplateView.as_view(template_name='index.html')),  # Leitet die Root-URL an die index.html weiter
]

# Registrierung der benutzerdefinierten 404-Fehleransicht
handler404 = custom_404_view


if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)