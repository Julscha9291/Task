# Generated by Django 4.2.5 on 2024-07-13 13:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0012_remove_contact_first_name_remove_contact_last_name_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contact',
            name='name',
            field=models.CharField(max_length=200),
        ),
    ]
