from rest_framework import viewsets, permissions
from pramlearnapp.models import Quiz
from pramlearnapp.serializers import QuizSerializer


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        material_id = self.request.query_params.get('material')
        if material_id:
            queryset = queryset.filter(material_id=material_id)
        return queryset
