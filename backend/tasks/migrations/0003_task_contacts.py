# Generated by Django 4.2.5 on 2024-07-02 18:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0002_contact'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='contacts',
            field=models.ManyToManyField(blank=True, related_name='tasks', to='tasks.contact'),
        ),
    ]
