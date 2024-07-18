from django.db import models
import random
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.dispatch import receiver
from django.db.models.signals import post_save


# Definieren Sie eine Liste von eindeutigen Farben
COLOR_CHOICES = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#A833FF', '#33FFF2', '#FF8333', '#33FF83', '#5733FF'
]

def get_unique_color():
    used_colors = set(Contact.objects.values_list('color', flat=True))
    available_colors = list(set(COLOR_CHOICES) - used_colors)
    if not available_colors:
        raise ValueError("Keine eindeutigen Farben mehr verfügbar")
    return random.choice(available_colors)

class Contact(models.Model):
    email = models.CharField(max_length=200, default='')
    first_name = models.CharField(max_length=200)
    last_name = models.CharField(max_length=200, default='Doe')
    color = models.CharField(max_length=7, default='#ffffff', unique=False)

    def save(self, *args, **kwargs):
        if not self.pk:  # Wenn der Kontakt neu ist
            if self.first_name and self.last_name:
                try:
                    user = CustomUser.objects.get(first_name=self.first_name, last_name=self.last_name)
                    self.color = user.color
                except CustomUser.DoesNotExist:
                    pass
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    username = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_set',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )
    color = models.CharField(max_length=7, default='#ffffff', unique=False)

    def __str__(self):
        return self.email


class Task(models.Model):
    CATEGORY_CHOICES = [
        ('to_do', 'To Do'),
        ('in_progress', 'In Progress'),
        ('awaiting', 'Awaiting Feedback'),
        ('done', 'Done'),
    ]
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)
    due_date = models.DateTimeField(null=True, blank=True)
    priority = models.CharField(max_length=50, null=True, blank=True, choices=PRIORITY_CHOICES)
    contacts = models.ManyToManyField(Contact, related_name='tasks', blank=True)  # Anpassung hier
    assigned_to = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='assigned_tasks', null=True, blank=True)
    
    def __str__(self):
        return self.title

class Subtask(models.Model):
    task = models.ForeignKey(Task, related_name='subtasks', on_delete=models.CASCADE)
    text = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.text