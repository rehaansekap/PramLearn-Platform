from django.db import models
from .classes import Class
from .user import CustomUser
from .quiz import Quiz  # Import the Quiz model
from .material import Material  # Import the Material model
from .quiz import Question  # Import the Question model


class Group(models.Model):
    """
    Model yang merepresentasikan kelompok.
    """
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class GroupMember(models.Model):
    """
    Model yang merepresentasikan anggota kelompok.
    """
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    class Meta:
        unique_together = (('group', 'student'),)


class GroupQuiz(models.Model):
    """
    Model yang merepresentasikan kuis yang dikerjakan oleh kelompok.
    """
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    def calculate_and_save_score(self):
        from .group import GroupQuizSubmission, GroupQuizResult
        questions = self.quiz.questions.all()
        total_questions = questions.count()
        correct_count = GroupQuizSubmission.objects.filter(
            group_quiz=self, is_correct=True
        ).count()
        score = (correct_count / total_questions) * \
            100 if total_questions > 0 else 0
        result, _ = GroupQuizResult.objects.update_or_create(
            group_quiz=self, defaults={"score": score}
        )
        return result


class GroupQuizSubmission(models.Model):
    """
    Model yang merepresentasikan jawaban kuis oleh anggota kelompok.
    """
    group_quiz = models.ForeignKey(GroupQuiz, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    selected_choice = models.CharField(
        max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])
    is_correct = models.BooleanField()

    class Meta:
        unique_together = ('group_quiz', 'question')

    def save(self, *args, **kwargs):
        # Check if there is already a submission for this group_quiz and question
        existing_submission = GroupQuizSubmission.objects.filter(
            group_quiz=self.group_quiz, question=self.question).first()
        if existing_submission:
            # Update the existing submission
            existing_submission.selected_choice = self.selected_choice
            existing_submission.is_correct = self.is_correct
            existing_submission.save()
        else:
            # Create a new submission
            super().save(*args, **kwargs)


class GroupQuizResult(models.Model):
    """
    Model yang menyimpan hasil kuis kelompok.
    """
    group_quiz = models.OneToOneField(GroupQuiz, on_delete=models.CASCADE)
    score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Result for {self.group_quiz.group.name} - {self.group_quiz.quiz.title}: {self.score}"
