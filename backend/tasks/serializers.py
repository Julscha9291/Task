from rest_framework import serializers
from .models import Task, Subtask, Contact,CustomUser, Notification
import random
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def get_unique_color():
    colors = [
    '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', 
    '#6c757d', '#6610f2', '#e83e8c', '#fd7e14', '#20c997',
    '#343a40', '#f8f9fa', '#ffffff', '#6f42c1', '#e9ecef',
    '#17a2b8', '#343a40', '#f5f5f5', '#212529', '#007bff',
    '#28a745', '#dc3545', '#ffc107', '#e83e8c', '#fd7e14',
    '#20c997', '#6c757d', '#6610f2', '#e9ecef', '#f1f1f1',
    '#d3d3d3', '#a9a9a9', '#ff6347', '#ff1493', '#00fa9a'
    ]
    used_colors = CustomUser.objects.values_list('color', flat=True)
    available_colors = [color for color in colors if color not in used_colors]
    
    if not available_colors:
        raise ValueError("No available colors")

    return random.choice(available_colors)


class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = ('id', 'text', 'completed')


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'first_name', 'last_name', 'color')


class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'password', 'color']

    def create(self, validated_data):
        color = get_unique_color()
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            password=validated_data['password'],
            color=color  # Farbezuteilung
        )
        return user
    
class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'email', 'color']
        
class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ('id', 'first_name','last_name', 'color')

class TaskSerializer(serializers.ModelSerializer):
    subtasks = SubtaskSerializer(many=True, required=False)
    contacts = ContactSerializer(many=True, required=False)

    class Meta:
        model = Task
        fields = ('id', 'title', 'description', 'category', 'due_date', 'priority', 'subtasks', 'contacts')

    def create(self, validated_data):
        subtasks_data = validated_data.pop('subtasks', [])
        contacts_data = validated_data.pop('contacts', [])
        task = Task.objects.create(**validated_data)
        for subtask_data in subtasks_data:
            Subtask.objects.create(task=task, **subtask_data)
        for contact_data in contacts_data:
            contact, created = Contact.objects.get_or_create(**contact_data)
            task.contacts.add(contact)
            
        self.send_task_notification(task)
        
        return task

    def send_task_notification(self, task):
        contacts = task.contacts.all()
        for contact in contacts:
            notification = Notification.objects.create(task=task, contacts=contact)
            
            serializer = NotificationSerializer(notification)
            message = serializer.data

            channel_layer = get_channel_layer()
            
            message = {
                'type': 'new_task_notification',
                'notification': message
            }

            async_to_sync(channel_layer.group_send)(
                'notifications',  
                {
                    'type': 'send_notification',
                    'message': message
                }
            )

    def update(self, instance, validated_data):
        if self.context['request'].method == 'PATCH':
            instance.category = validated_data.get('category', instance.category)
            instance.save()
            return instance

        subtasks_data = validated_data.pop('subtasks', [])
        contacts_data = validated_data.pop('contacts', [])

        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.category = validated_data.get('category', instance.category)
        instance.due_date = validated_data.get('due_date', instance.due_date)
        instance.priority = validated_data.get('priority', instance.priority)
        instance.save()

        instance.subtasks.all().delete()
        for subtask_data in subtasks_data:
            Subtask.objects.create(task=instance, **subtask_data)

        instance.contacts.clear()
        for contact_data in contacts_data:
            contact, created = Contact.objects.get_or_create(**contact_data)
            instance.contacts.add(contact)

        return instance

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'contacts', 'task', 'created_at', 'is_read')