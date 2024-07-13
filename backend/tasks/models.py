from django.db import models
import random
from django.contrib.auth.models import AbstractUser, BaseUserManager


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
    name = models.CharField(max_length=200)
    color = models.CharField(max_length=7, default='#ffffff', unique=True)  # Make color unique

    def save(self, *args, **kwargs):
        if not self.color or self.color == '#ffffff':
            self.color = get_unique_color()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

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
    contacts = models.ManyToManyField(Contact, related_name='tasks', blank=True)

    def __str__(self):
        return self.title


class Subtask(models.Model):
    task = models.ForeignKey(Task, related_name='subtasks', on_delete=models.CASCADE)
    text = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.text


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

    def __str__(self):
        return self.email
    
