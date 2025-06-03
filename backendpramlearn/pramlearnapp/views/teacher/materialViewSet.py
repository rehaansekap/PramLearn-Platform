from rest_framework import viewsets, generics, permissions
from django.http import Http404
from pramlearnapp.models import Material, Subject
from pramlearnapp.serializers import MaterialSerializer, MaterialDetailSerializer
from rest_framework.response import Response
from rest_framework import status


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        subject_id = self.kwargs.get('subject_id')
        subject = Subject.objects.get(pk=subject_id)
        serializer.save(subject=subject)

    def perform_update(self, serializer):
        subject_id = self.request.data.get('subject')
        if subject_id:
            subject = Subject.objects.get(pk=subject_id)
            serializer.save(subject=subject)
        else:
            serializer.save()

    def destroy(self, request, *args, **kwargs):
        material = self.get_object()
        material.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MaterialDetailView(generics.RetrieveAPIView):
    queryset = Material.objects.all()
    serializer_class = MaterialDetailSerializer
    lookup_field = 'slug'

    def get(self, request, *args, **kwargs):
        slug = kwargs.get('slug')
        print(f"Fetching material with slug: {slug}")
        try:
            material = Material.objects.get(slug=slug)
            print(f"Material found: {material.title}")
        except Material.DoesNotExist:
            print(f"Material with slug {slug} not found")
            raise Http404("Material not found")
        return super().get(request, *args, **kwargs)
