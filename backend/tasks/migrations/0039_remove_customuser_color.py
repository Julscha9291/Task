# Generated by Django 4.2.5 on 2024-07-15 17:25

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0038_contact_email'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='color',
        ),
    ]
