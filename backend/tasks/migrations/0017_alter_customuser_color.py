# Generated by Django 4.2.5 on 2024-07-13 16:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0016_customuser_color'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='color',
            field=models.CharField(default='#ffffff', max_length=7),
        ),
    ]
