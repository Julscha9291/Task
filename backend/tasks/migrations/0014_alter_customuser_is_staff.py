# Generated by Django 4.2.5 on 2024-07-13 13:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0013_alter_contact_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='is_staff',
            field=models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status'),
        ),
    ]
