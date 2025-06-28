from rest_framework import serializers
from pramlearnapp.models.arcs_questionnaire import (
    ARCSQuestionnaire,
    ARCSQuestion,
    ARCSResponse,
    ARCSAnswer,
)


class ARCSQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ARCSQuestion
        fields = [
            "id",
            "text",
            "dimension",
            "question_type",
            "order",
            "is_required",
            "choice_a",
            "choice_b",
            "choice_c",
            "choice_d",
            "choice_e",
            "created_at",
            "updated_at",
        ]


class ARCSQuestionnaireSerializer(serializers.ModelSerializer):
    questions = ARCSQuestionSerializer(many=True, read_only=True)
    questions_count = serializers.SerializerMethodField()
    responses_count = serializers.SerializerMethodField()
    completion_rate = serializers.SerializerMethodField()
    is_available_for_submission = serializers.SerializerMethodField()
    time_remaining = serializers.SerializerMethodField()
    status_message = serializers.SerializerMethodField()

    class Meta:
        model = ARCSQuestionnaire
        fields = [
            "id",
            "title",
            "description",
            "questionnaire_type",
            "is_active",
            "start_date",
            "end_date",
            "duration_minutes",
            "slug",
            "created_at",
            "updated_at",
            "questions",
            "questions_count",
            "responses_count",
            "completion_rate",
            "is_available_for_submission",
            "time_remaining",
            "status_message",
        ]

    def get_questions_count(self, obj):
        return obj.questions.count()

    def get_responses_count(self, obj):
        return obj.responses.filter(is_completed=True).count()

    def get_completion_rate(self, obj):
        # Calculate completion rate based on material's class students
        from pramlearnapp.models.classes import ClassStudent
        from pramlearnapp.models.subject import SubjectClass

        try:
            subject_class = SubjectClass.objects.get(subject=obj.material.subject)
            total_students = ClassStudent.objects.filter(
                class_id=subject_class.class_id
            ).count()
            completed_responses = obj.responses.filter(is_completed=True).count()

            if total_students > 0:
                return round((completed_responses / total_students) * 100, 1)
            return 0.0
        except:
            return 0.0

    def get_is_available_for_submission(self, obj):
        is_available, _ = obj.is_available_for_submission
        return is_available

    def get_time_remaining(self, obj):
        return obj.time_remaining

    def get_status_message(self, obj):
        _, message = obj.is_available_for_submission
        return message


class ARCSQuestionnaireCreateSerializer(serializers.ModelSerializer):
    questions = ARCSQuestionSerializer(many=True, required=False)

    class Meta:
        model = ARCSQuestionnaire
        fields = [
            "title",
            "description",
            "questionnaire_type",
            "is_active",
            "start_date",
            "end_date",
            "duration_minutes",
            "questions",
        ]

    def validate(self, data):
        """Validate date fields"""
        start_date = data.get("start_date")
        end_date = data.get("end_date")

        if start_date and end_date:
            if start_date >= end_date:
                raise serializers.ValidationError(
                    "Tanggal mulai harus sebelum tanggal berakhir"
                )

        duration_minutes = data.get("duration_minutes")
        if duration_minutes and duration_minutes <= 0:
            raise serializers.ValidationError("Durasi harus lebih dari 0 menit")

        return data

    def create(self, validated_data):
        questions_data = validated_data.pop("questions", [])
        questionnaire = ARCSQuestionnaire.objects.create(**validated_data)

        for question_data in questions_data:
            ARCSQuestion.objects.create(questionnaire=questionnaire, **question_data)

        return questionnaire

    def update(self, instance, validated_data):
        questions_data = validated_data.pop("questions", None)

        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if questions_data is not None:
            # Optional: hapus semua pertanyaan lama, lalu tambah baru
            instance.questions.all().delete()
            for question_data in questions_data:
                ARCSQuestion.objects.create(questionnaire=instance, **question_data)

        return instance


class ARCSAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source="question.text", read_only=True)
    dimension = serializers.CharField(source="question.dimension", read_only=True)

    class Meta:
        model = ARCSAnswer
        fields = [
            "id",
            "question",
            "question_text",
            "dimension",
            "likert_value",
            "choice_value",
            "text_value",
            "answered_at",
        ]


class ARCSResponseSerializer(serializers.ModelSerializer):
    answers = ARCSAnswerSerializer(many=True, read_only=True)
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)
    student_username = serializers.CharField(source="student.username", read_only=True)

    class Meta:
        model = ARCSResponse
        fields = [
            "id",
            "student",
            "student_name",
            "student_username",
            "submitted_at",
            "completed_at",
            "is_completed",
            "answers",
        ]
