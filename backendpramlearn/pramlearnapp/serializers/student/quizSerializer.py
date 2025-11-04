from rest_framework import serializers
from pramlearnapp.models import Quiz, GroupQuiz, GroupQuizSubmission, Question, Group, GroupMember


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'choice_a', 'choice_b', 'choice_c', 'choice_d']


class GroupQuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(
        source='quiz.questions', many=True, read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    quiz_content = serializers.CharField(source='quiz.content', read_only=True)

    class Meta:
        model = GroupQuiz
        fields = ['id', 'quiz_title', 'quiz_content',
                  'start_time', 'end_time', 'questions']


class GroupQuizSubmissionSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(
        source='question.text', read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = GroupQuizSubmission
        fields = ['id', 'question', 'question_text',
                  'selected_choice', 'is_correct', 'student_name']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}".strip() or obj.student.username
