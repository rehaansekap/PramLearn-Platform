from django.db import models
from django.utils import timezone
from .classes import Class
from .user import CustomUser
from .quiz import Quiz
from .material import Material
from .quiz import Question


class Group(models.Model):
    """Model yang merepresentasikan kelompok."""
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class GroupMember(models.Model):
    """Model yang merepresentasikan anggota kelompok."""
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    class Meta:
        unique_together = (('group', 'student'),)


class GroupQuiz(models.Model):
    """Model yang merepresentasikan kuis yang dikerjakan oleh kelompok."""
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(
        default=False)  # Track completion status

    def calculate_and_save_score(self):
        # timezone is now imported at the top
        from django.utils import timezone

        questions = self.quiz.questions.all()
        total_questions = questions.count()

        if total_questions == 0:
            score = 0
        else:
            correct_count = GroupQuizSubmission.objects.filter(
                group_quiz=self,
                is_correct=True
            ).count()
            score = (correct_count / total_questions) * 100

        # Get or create result
        result, created = GroupQuizResult.objects.get_or_create(
            group_quiz=self,
            defaults={'score': score, 'completed_at': timezone.now()}
        )

        if not created:
            result.score = score
            result.updated_at = timezone.now()
            result.save()

        # Mark as completed
        self.is_completed = True
        self.save()

        return result


class GroupQuizSubmission(models.Model):
    """Model yang merepresentasikan jawaban kuis oleh anggota kelompok."""
    group_quiz = models.ForeignKey(
        GroupQuiz, on_delete=models.CASCADE, related_name='submissions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    # Who submitted this answer
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    selected_choice = models.CharField(
        max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])
    is_correct = models.BooleanField()
    submitted_at = models.DateTimeField(auto_now=True)

    class Meta:
        # One answer per question per group
        unique_together = ('group_quiz', 'question')

    def save(self, *args, **kwargs):
        # Auto-calculate if correct
        if self.question.correct_choice:
            self.is_correct = self.selected_choice == self.question.correct_choice
        super().save(*args, **kwargs)


class GroupQuizResult(models.Model):
    """Model yang menyimpan hasil kuis kelompok."""
    group_quiz = models.OneToOneField(
        GroupQuiz, on_delete=models.CASCADE, related_name='result')
    score = models.FloatField(default=0.0)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.group_quiz.group.name} - {self.group_quiz.quiz.title}: {self.score}"
