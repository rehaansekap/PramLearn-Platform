from rest_framework import serializers
from pramlearnapp.models.arcs_questionnaire import (
    ARCSQuestionnaire,
    ARCSQuestion,
    ARCSResponse,
    ARCSAnswer,
)


class StudentARCSQuestionSerializer(serializers.ModelSerializer):
    """
    Serializer untuk pertanyaan ARCS untuk student
    """

    choices = serializers.ReadOnlyField()
    scale_labels = serializers.ReadOnlyField()

    class Meta:
        model = ARCSQuestion
        fields = [
            "id",
            "text",
            "dimension",
            "order",
            "question_type",
            "choices",
            "scale_min",
            "scale_max",
            "scale_labels",
            "is_required",
        ]


class StudentARCSQuestionnaireSerializer(serializers.ModelSerializer):
    """
    Serializer untuk kuesioner ARCS untuk student
    """

    questions = StudentARCSQuestionSerializer(many=True, read_only=True)
    total_questions = serializers.SerializerMethodField()
    is_available_for_submission = serializers.SerializerMethodField()
    status_message = serializers.SerializerMethodField()
    time_remaining = serializers.SerializerMethodField()

    class Meta:
        model = ARCSQuestionnaire
        fields = [
            "id",
            "title",
            "description",
            "questionnaire_type",
            "start_date",
            "end_date",
            "duration_minutes",
            "questions",
            "total_questions",
            "is_available_for_submission",
            "status_message",
            "time_remaining",
            "slug",
        ]

    def get_total_questions(self, obj):
        return obj.questions.count()

    def get_is_available_for_submission(self, obj):
        is_available, _ = obj.is_available_for_submission
        return is_available

    def get_status_message(self, obj):
        _, message = obj.is_available_for_submission
        return message

    def get_time_remaining(self, obj):
        return obj.time_remaining


class StudentARCSAnswerSerializer(serializers.ModelSerializer):
    """
    Serializer untuk jawaban ARCS dari student
    """

    class Meta:
        model = ARCSAnswer
        fields = ["question", "text_value", "choice_value", "likert_value"]


class StudentARCSResponseSerializer(serializers.ModelSerializer):
    """
    Serializer untuk response ARCS dari student
    """

    answers = StudentARCSAnswerSerializer(many=True)

    class Meta:
        model = ARCSResponse
        fields = [
            "id",
            "questionnaire",
            "student",
            "submitted_at",
            "completed_at",
            "is_completed",
            "answers",
        ]
        read_only_fields = ["student", "submitted_at"]


class StudentARCSSubmitSerializer(serializers.Serializer):
    """
    Serializer untuk submit jawaban ARCS
    """

    answers = serializers.ListField(child=serializers.DictField(), allow_empty=False)

    def validate_answers(self, value):
        """
        Validate answers format
        """
        required_fields = ["question_id"]

        for answer in value:
            for field in required_fields:
                if field not in answer:
                    raise serializers.ValidationError(
                        f"Field '{field}' is required for each answer"
                    )

            # At least one answer type should be provided
            answer_types = ["text_value", "choice_value", "likert_value"]
            if not any(answer.get(field) for field in answer_types):
                raise serializers.ValidationError(
                    "At least one answer type must be provided"
                )

        return value
