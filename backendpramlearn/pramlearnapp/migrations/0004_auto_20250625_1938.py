from django.db import migrations, models


def reset_motivation_levels(apps, schema_editor):
    """Reset semua motivation_level ke NULL"""
    StudentMotivationProfile = apps.get_model(
        'pramlearnapp', 'StudentMotivationProfile')
    StudentMotivationProfile.objects.all().update(motivation_level=None)


def reverse_reset_motivation_levels(apps, schema_editor):
    """Reverse function - tidak melakukan apa-apa"""
    pass


class Migration(migrations.Migration):
    dependencies = [
        # Ganti dengan migration sebelumnya
        ('pramlearnapp', '0003_alter_studentmotivationprofile_motivation_level'),
    ]

    operations = [
        migrations.AlterField(
            model_name='studentmotivationprofile',
            name='motivation_level',
            field=models.CharField(
                blank=True,
                choices=[('Low', 'Low'), ('Medium', 'Medium'),
                         ('High', 'High')],
                default=None,
                max_length=10,
                null=True
            ),
        ),
        migrations.RunPython(reset_motivation_levels,
                             reverse_reset_motivation_levels),
    ]
