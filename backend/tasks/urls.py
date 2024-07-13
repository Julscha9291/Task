from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, SubtaskViewSet, SummaryView, UserRegistrationView, LoginView

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'subtasks', SubtaskViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('summary/', SummaryView.as_view(), name='summary'),
   path('register/', UserRegistrationView.as_view(), name='user-register'),
        path('login/', LoginView.as_view(), name='login'),
]