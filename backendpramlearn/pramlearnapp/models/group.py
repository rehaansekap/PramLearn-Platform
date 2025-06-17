from django.db import models
from django.utils import timezone
from datetime import timedelta
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
    submitted_at = models.DateTimeField(
        null=True, blank=True)  # ADD THIS FIELD

    class Meta:
        unique_together = ('quiz', 'group')

    def __str__(self):
        return f"{self.group.name} - {self.quiz.title}"

    def calculate_and_save_score(self):
        """Calculate and save score - hanya dipanggil saat submit"""
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
            result.completed_at = timezone.now()  # ✅ Update completion time
            result.save()

        # ✅ PENTING: Set kedua field ini bersamaan saat submit
        self.is_completed = True
        self.submitted_at = timezone.now()
        self.save()

        return result

    def test_group_quiz_assignment():
        # Get data
        quiz = Quiz.objects.filter(slug='quiz-1').first()
        user = CustomUser.objects.filter(username='student1').first()

        print(f"Quiz: {quiz}")
        print(f"User: {user}")

        if not quiz or not user:
            print("❌ Quiz or user not found")
            return

        # Find user's group
        user_group = GroupMember.objects.filter(student=user).first()
        if user_group:
            print(
                f"✅ User is in group: {user_group.group.id} ({user_group.group.name})")

            # Check if GroupQuiz exists for this group
            group_quiz = GroupQuiz.objects.filter(
                quiz=quiz,
                group=user_group.group
            ).first()

            if group_quiz:
                print(f"✅ GroupQuiz exists: {group_quiz}")
            else:
                print(
                    f"❌ No GroupQuiz found for quiz {quiz.id} and group {user_group.group.id}")

                # Create GroupQuiz if needed
                group_quiz = GroupQuiz.objects.create(
                    quiz=quiz,
                    group=user_group.group,
                    start_time=timezone.now(),
                    end_time=timezone.now() + timedelta(hours=1)
                )
                print(f"✅ Created GroupQuiz: {group_quiz}")
        else:
            print("❌ User is not in any group")

    if __name__ == "__main__":
        test_group_quiz_assignment()


class GroupQuizSubmission(models.Model):
    """Model yang merepresentasikan jawaban kuis oleh anggota kelompok."""
    group_quiz = models.ForeignKey(
        GroupQuiz, on_delete=models.CASCADE, related_name='submissions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    student = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE)  # Pastikan ini 'student'
    selected_choice = models.CharField(
        max_length=1,
        choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')]
    )
    is_correct = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now=True)

    class Meta:
        # One answer per question per group
        unique_together = ('group_quiz', 'question')

    def save(self, *args, **kwargs):
        # Auto-calculate if correct
        if self.question and self.question.correct_choice:
            self.is_correct = self.selected_choice == self.question.correct_choice
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.group_quiz.group.name} - Q{self.question.id}: {self.selected_choice}"


class GroupQuizResult(models.Model):
    """Model yang menyimpan hasil kuis kelompok."""
    group_quiz = models.OneToOneField(
        GroupQuiz, on_delete=models.CASCADE, related_name='result')
    score = models.FloatField(default=0.0)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        import traceback
        print(f"🔍 GroupQuizResult.save() called for {self}")
        print(f"🔍 Call stack:")
        traceback.print_stack()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.group_quiz.group.name} - {self.group_quiz.quiz.title}: {self.score}"
