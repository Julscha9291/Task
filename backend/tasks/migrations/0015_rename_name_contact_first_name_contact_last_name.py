# Generated by Django 4.2.5 on 2024-07-13 13:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0014_alter_customuser_is_staff'),
    ]

    operations = [
        migrations.RenameField(
            model_name='contact',
            old_name='name',
            new_name='first_name',
        ),
        migrations.AddField(
            model_name='contact',
            name='last_name',
            field=models.CharField(default='', max_length=200),
        ),
    ]
