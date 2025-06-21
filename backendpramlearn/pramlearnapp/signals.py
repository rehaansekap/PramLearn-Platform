import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import GroupQuiz, AssignmentSubmission, StudentMaterialProgress, StudentMaterialActivity

logger = logging.getLogger(__name__)


@receiver(post_save, sender=GroupQuiz)
def update_progress_on_quiz_completion(sender, instance, **kwargs):
    """Update material progress when group quiz is completed"""
    if instance.is_completed and instance.submitted_at:
        logger.info(
            f"🎯 Quiz completed: {instance.quiz.title} by group {instance.group.name}")

        # Update progress untuk semua member grup
        for member in instance.group.groupmember_set.all():
            try:
                # ✅ TAMBAHAN: Record activity untuk quiz completion
                activity, activity_created = StudentMaterialActivity.objects.get_or_create(
                    student=member.student,
                    material=instance.quiz.material,
                    activity_type='quiz_completed',
                    content_id=f"quiz_completed_{instance.quiz.id}",
                    defaults={
                        'content_index': instance.quiz.id,
                    }
                )

                if activity_created:
                    logger.info(
                        f"📝 Quiz completion activity created for {member.student.username}")

                # Import di sini untuk avoid circular import
                from .views.student.materialProgressView import StudentMaterialProgressView

                progress_view = StudentMaterialProgressView()
                total_completion = progress_view.calculate_total_completion(
                    member.student,
                    instance.quiz.material
                )

                progress, created = StudentMaterialProgress.objects.get_or_create(
                    student=member.student,
                    material=instance.quiz.material,
                    defaults={'completion_percentage': 0.0}
                )

                if total_completion > progress.completion_percentage:
                    old_progress = progress.completion_percentage
                    progress.completion_percentage = total_completion
                    progress.save()

                    logger.info(
                        f"📈 Progress updated for {member.student.username}: {old_progress:.1f}% → {total_completion:.1f}%")

            except Exception as e:
                logger.error(
                    f"❌ Error updating progress for {member.student}: {e}")


@receiver(post_save, sender=AssignmentSubmission)
def update_progress_on_assignment_submission(sender, instance, **kwargs):
    """Update material progress when assignment is submitted"""
    if not instance.is_draft and hasattr(instance, 'assignment'):  # Assignment sudah di-submit
        logger.info(
            f"📝 Assignment submitted: {instance.assignment.title} by {instance.student.username}")

        try:
            # ✅ TAMBAHAN: Record activity untuk assignment submission
            activity, activity_created = StudentMaterialActivity.objects.get_or_create(
                student=instance.student,
                material=instance.assignment.material,
                activity_type='assignment_submitted',
                content_id=f"assignment_submitted_{instance.assignment.id}",
                defaults={
                    'content_index': instance.assignment.id,
                }
            )

            if activity_created:
                logger.info(
                    f"📝 Assignment submission activity created for {instance.student.username}")

            # Import di sini untuk avoid circular import
            from .views.student.materialProgressView import StudentMaterialProgressView

            progress_view = StudentMaterialProgressView()
            total_completion = progress_view.calculate_total_completion(
                instance.student,
                instance.assignment.material
            )

            progress, created = StudentMaterialProgress.objects.get_or_create(
                student=instance.student,
                material=instance.assignment.material,
                defaults={'completion_percentage': 0.0}
            )

            if total_completion > progress.completion_percentage:
                old_progress = progress.completion_percentage
                progress.completion_percentage = total_completion
                progress.save()

                logger.info(
                    f"📈 Progress updated for {instance.student.username}: {old_progress:.1f}% → {total_completion:.1f}%")

        except Exception as e:
            logger.error(
                f"❌ Error updating progress for {instance.student}: {e}")
