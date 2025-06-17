from rest_framework import serializers
from pramlearnapp.models import Assignment, AssignmentSubmission, CustomUser, StudentMotivationProfile
from pramlearnapp.models.assignment import AssignmentQuestion, AssignmentAnswer
from pramlearnapp.serializers.student.studentSerializer import StudentDetailSerializer


class AssignmentQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentQuestion
        fields = ['id', 'assignment', 'text', 'choice_a',
                  'choice_b', 'choice_c', 'choice_d', 'correct_choice']


class AssignmentAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentAnswer
        fields = ['id', 'submission', 'question',
                  'selected_choice', 'is_correct']

    def validate(self, data):
        submission = data['submission']
        question = data['question']
        # Pastikan question memang milik assignment pada submission
        if question.assignment_id != submission.assignment_id:
            raise serializers.ValidationError(
                "Soal tidak sesuai dengan assignment pada submission ini.")


class AssignmentSerializer(serializers.ModelSerializer):
    questions = AssignmentQuestionSerializer(many=True, read_only=True)
    slug = serializers.SerializerMethodField()

    def get_slug(self, obj):
        return obj.title.lower().replace(' ', '-').replace('[^a-z0-9-]', '')

    class Meta:
        model = Assignment
        fields = ['id', 'material', 'title', 'slug',
                  'description', 'due_date', 'questions']


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    answers = AssignmentAnswerSerializer(many=True, read_only=True)
    student_detail = StudentDetailSerializer(source='student', read_only=True)

    class Meta:
        model = AssignmentSubmission
        fields = ['id', 'assignment', 'student',
                  'submission_date', 'grade', 'answers', 'student_detail']


class AssignmentAnswerStudentInputSerializer(serializers.Serializer):
    question = serializers.PrimaryKeyRelatedField(
        queryset=AssignmentQuestion.objects.all())
    selected_choice = serializers.ChoiceField(
        choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])


class AssignmentSubmissionStudentInputSerializer(serializers.Serializer):
    assignment = serializers.PrimaryKeyRelatedField(
        queryset=AssignmentSubmission._meta.get_field('assignment').related_model.objects.all())
    answers = AssignmentAnswerStudentInputSerializer(many=True)

    def create(self, validated_data):
        request = self.context['request']
        student = request.user
        assignment = validated_data['assignment']
        submission = AssignmentSubmission.objects.create(
            assignment=assignment,
            student=student,
            submission_date=validated_data.get('submission_date'),
        )
        answers_data = validated_data['answers']
        for ans in answers_data:
            AssignmentAnswer.objects.create(
                submission=submission,
                question=ans['question'],
                selected_choice=ans['selected_choice']
            )
        submission.calculate_and_save_grade()
        return submission
