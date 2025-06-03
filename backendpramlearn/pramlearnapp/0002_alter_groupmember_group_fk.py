from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('pramlearnapp', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                "ALTER TABLE pramlearnapp_groupmember DROP FOREIGN KEY pramlearnapp_groupme_group_id_ab01f77b_fk_pramlearn;",
                "ALTER TABLE pramlearnapp_groupmember ADD CONSTRAINT pramlearnapp_groupme_group_id_ab01f77b_fk_pramlearn FOREIGN KEY (group_id) REFERENCES pramlearnapp_group(id) ON DELETE CASCADE;"
            ],
            reverse_sql=[
                "ALTER TABLE pramlearnapp_groupmember DROP FOREIGN KEY pramlearnapp_groupme_group_id_ab01f77b_fk_pramlearn;",
                "ALTER TABLE pramlearnapp_groupmember ADD CONSTRAINT pramlearnapp_groupme_group_id_ab01f77b_fk_pramlearn FOREIGN KEY (group_id) REFERENCES pramlearnapp_group(id);"
            ]
        )
    ]
