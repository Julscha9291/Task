# Generated by Django 4.2.5 on 2024-07-14 14:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0026_remove_task_assigned_to_task_assigned_to'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='task',
            name='assigned_to',
        ),
    ]
