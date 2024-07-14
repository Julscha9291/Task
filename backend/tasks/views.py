
from rest_framework import viewsets, generics, status, permissions
from .models import Task, Subtask, Contact, CustomUser
from .serializers import TaskSerializer, SubtaskSerializer, UserRegistrationSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Min
from rest_framework import status
from rest_framework.decorators import api_view
import logging
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, email=email, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            user.is_active = True  
            return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                    }
                })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


logger = logging.getLogger(__name__)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class SubtaskViewSet(viewsets.ModelViewSet):
    queryset = Subtask.objects.all()
    serializer_class = SubtaskSerializer

class SummaryView(APIView):

    def get(self, request):
        total_tasks = Task.objects.count()
        tasks_by_category = Task.objects.values('category').annotate(count=Count('category'))
        urgent_tasks = Task.objects.filter(priority='urgent').count()
        next_deadline = Task.objects.filter(due_date__isnull=False).order_by('due_date').first()

        summary_data = {
            'total_tasks': total_tasks,
            'tasks_by_category': list(tasks_by_category),
            'urgent_tasks': urgent_tasks,
            'next_deadline': next_deadline.due_date if next_deadline else None
        }
        return Response(summary_data, status=status.HTTP_200_OK)
    
    

logger = logging.getLogger(__name__)

class UserRegistrationView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    
    
    