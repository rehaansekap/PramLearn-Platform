from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import ProtectedError
from pramlearnapp.models import Subject, SubjectClass
from pramlearnapp.serializers import SubjectSerializer, SubjectDetailSerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            SubjectClass.objects.filter(subject=instance).delete()
            self.perform_destroy(instance)
        except ProtectedError:
            return Response(
                {"error": "Cannot delete this subject because it is referenced by other objects."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(status=status.HTTP_204_NO_CONTENT)

    # @action(detail=False, methods=['get'], url_path='unassigned')
    # def unassigned(self, request):
    #     # Ambil subject yang belum punya teacher
    #     subjects = Subject.objects.filter(subject_class__teacher__isnull=True)
    #     serializer = self.get_serializer(subjects, many=True)
    #     return Response(serializer.data)


class SubjectDetailView(generics.RetrieveAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectDetailSerializer
    lookup_field = 'slug'
