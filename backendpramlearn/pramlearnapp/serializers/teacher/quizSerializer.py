# backendpramlearn/pramlearnapp/serializers/teacher/quizSerializer.py
from rest_framework import serializers
from pramlearnapp.models import Quiz, Question


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'choice_a', 'choice_b',
                  'choice_c', 'choice_d', 'correct_choice']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)

    class Meta:
        model = Quiz
        fields = '__all__'
        # fields = ['id', 'material', 'title',
        #           'content', 'is_group_quiz', 'questions']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        quiz = Quiz.objects.create(**validated_data)
        for question_data in questions_data:
            Question.objects.create(quiz=quiz, **question_data)
        return quiz

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if questions_data is not None:
            # Optional: hapus semua question lama, lalu tambah baru
            instance.questions.all().delete()
            for question_data in questions_data:
                Question.objects.create(quiz=instance, **question_data)
        return instance

    def get_assigned_groups(self, obj):
        return list(obj.groupquiz_set.values_list('group_id', flat=True))
