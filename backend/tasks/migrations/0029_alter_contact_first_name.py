# Generated by Django 4.2.5 on 2024-07-14 15:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0028_task_contacts'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contact',
            name='first_name',
            field=models.CharField(max_length=200),
        ),
    ]
