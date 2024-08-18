from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, SubtaskViewSet, SummaryView, UserRegistrationView, LoginView,UserProfileView, UserListView, ContactViewSet, UserContactView, UserTaskSummaryView
from . import consumers
router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'subtasks', SubtaskViewSet)
router.register(r'contacts', ContactViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('summary/', SummaryView.as_view(), name='summary'),
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
       path('users/', UserListView.as_view(), name='user-list'), 
   path('user-contact/', UserContactView.as_view(), name='user-contact'),
   path('users/<int:user_id>/user-summary/', UserTaskSummaryView.as_view(), name='user-task-summary'),

]

websocket_urlpatterns = [
    re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
    re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi())
]