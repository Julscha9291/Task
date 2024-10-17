from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect  # Importiere die Umleitungsfunktion

# Umleitung zur Login-Seite
def redirect_to_login(request):
    return redirect('login')  # Umleitung zur Login-URL

urlpatterns = [
    path('', redirect_to_login, name='redirect_to_login'),  # Definiere die Root-URL
    path('admin/', admin.site.urls),
    path('api/', include('tasks.urls')),  # Registriere deine tasks-URLs
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)