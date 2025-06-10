from rest_framework import viewsets, generics, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.http import Http404
from pramlearnapp.models import Material, Subject, StudentActivity
from pramlearnapp.serializers import MaterialSerializer, MaterialDetailSerializer
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'

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

    def get_serializer_class(self):
        if self.action == "retrieve":
            return MaterialDetailSerializer
        return MaterialSerializer


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


class MaterialAccessView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, material_id):
        user = request.user
        try:
            material = Material.objects.get(pk=material_id)
        except Material.DoesNotExist:
            return Response({"detail": "Material not found."}, status=404)

        # Catat aktivitas akses materi
        StudentActivity.objects.create(
            student=user,
            title=f"Mengakses Materi: {material.title}",
            # description=f"Kamu membuka materi '{material.title}'."
            activity_type="material",
            timestamp=timezone.now(),
        )
        return Response({"detail": "Material access recorded."}, status=200)
