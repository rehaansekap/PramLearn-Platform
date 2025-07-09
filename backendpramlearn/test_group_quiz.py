import os
import django

# Configure Django settings FIRST
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pramlearn_api.settings')
django.setup()

# THEN import Django models
from pramlearnapp.models import GroupQuiz, GroupQuizSubmission, Question, CustomUser, Group


def test_save_submission():
    try:
        # Get data yang diperlukan
        group_quiz = GroupQuiz.objects.first()
        question = Question.objects.first()
        user = CustomUser.objects.filter(role=3).first()  # Student

        print(f"GroupQuiz: {group_quiz}")
        print(f"Question: {question}")
        print(f"User: {user}")

        if not all([group_quiz, question, user]):
            print("❌ Missing required data")
            return

        # Test create submission
        submission = GroupQuizSubmission.objects.create(
            group_quiz=group_quiz,
            question=question,
            student=user,
            selected_choice='A',
            is_correct=True
        )

        print(f"✅ Created submission: {submission}")

        # Test retrieve
        retrieved = GroupQuizSubmission.objects.filter(
            group_quiz=group_quiz,
            question=question
        ).first()

        print(f"✅ Retrieved submission: {retrieved}")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_save_submission()