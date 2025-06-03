from rest_framework import viewsets, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import Http404
from pramlearnapp.models import Class, SubjectClass
from pramlearnapp.serializers import ClassSerializer, ClassDetailSerializer, SubjectClassSerializer


class ClassViewSet(viewsets.ModelViewSet):
    """
    ViewSet untuk melihat dan mengedit instance Class.
    """
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ClassDetailSerializer
        return ClassSerializer

    @action(detail=True, methods=['delete'])
    def delete_class(self, request, pk=None):
        try:
            class_instance = self.get_object()
            subject_classes = SubjectClass.objects.filter(
                class_id=class_instance)
            if not subject_classes.exists():
                class_instance.delete()
                return Response(status=204)
            return Response(status=400, data={"detail": "Class has related SubjectClasses."})
        except Class.DoesNotExist:
            return Response(status=404, data={"detail": "Class not found."})


class ClassWithStudentsViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        students = ClassStudent.objects.filter(
            class_id=instance.id).select_related('student')
        response_data = {
            'class': self.get_serializer(instance).data,
            'students': [student.student.username for student in students]
        }
        return Response(response_data)


class ClassDetailPage(generics.RetrieveAPIView):
    queryset = Class.objects.all()
    serializer_class = ClassDetailSerializer
    lookup_field = 'slug'

    def get(self, request, *args, **kwargs):
        slug = kwargs.get('slug')
        print(f"Fetching class with slug: {slug}")
        try:
            class_instance = Class.objects.get(slug=slug)
            print(f"Class found: {class_instance.name}")
        except Class.DoesNotExist:
            print(f"Class with slug {slug} not found")
            raise Http404("Class not found")
        return super().get(request, *args, **kwargs)


class SubjectClassViewSet(viewsets.ModelViewSet):
    queryset = SubjectClass.objects.all()
    serializer_class = SubjectClassSerializer
    permission_classes = [permissions.IsAuthenticated]


class SubjectClassDetail(generics.RetrieveDestroyAPIView):
    queryset = SubjectClass.objects.all()
    serializer_class = SubjectClassSerializer

    def get_object(self):
        queryset = self.get_queryset()
        filter_kwargs = {
            'subject_id': self.kwargs['subject_id'],
            'class_id': self.kwargs['class_id']
        }
        return generics.get_object_or_404(queryset, **filter_kwargs)
