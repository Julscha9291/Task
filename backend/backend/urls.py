from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect  # Importiere die Umleitungsfunktion

# Umleitung zur API oder einer spezifischen Seite
def redirect_to_api(request):
    return redirect('api/')  # Hier kannst du die gewünschte Ziel-URL angeben

urlpatterns = [
    path('', redirect_to_api, name='redirect_to_api'),  # Definiere die Root-URL
    path('admin/', admin.site.urls),
    path('api/', include('tasks.urls')),  # Registriere deine tasks-URLs
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)