from rest_framework import serializers
from .models import Task, Subtask, Contact,CustomUser
from django.contrib.auth.models import User

class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = ('id', 'text', 'completed')

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ('id', 'name', 'color')

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
        return task

    def update(self, instance, validated_data):
        # Überprüfe, ob es sich um einen PATCH-Request handelt
        if self.context['request'].method == 'PATCH':
            instance.category = validated_data.get('category', instance.category)
            instance.save()
            return instance

        subtasks_data = validated_data.pop('subtasks', [])
        contacts_data = validated_data.pop('contacts', [])

        # Update fields of the Task instance
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.category = validated_data.get('category', instance.category)
        instance.due_date = validated_data.get('due_date', instance.due_date)
        instance.priority = validated_data.get('priority', instance.priority)
        instance.save()

        # Update subtasks
        instance.subtasks.all().delete()  # Remove existing subtasks
        for subtask_data in subtasks_data:
            Subtask.objects.create(task=instance, **subtask_data)

        # Update contacts
        instance.contacts.clear()  # Remove existing contacts
        for contact_data in contacts_data:
            contact, created = Contact.objects.get_or_create(**contact_data)
            instance.contacts.add(contact)

        return instance


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'password')



class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'password']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
             first_name=validated_data['first_name'],
              last_name=validated_data['last_name'],
            email=validated_data['email'],
            password=validated_data['password']  # Das Passwort wird automatisch gehasht
        )
        return user