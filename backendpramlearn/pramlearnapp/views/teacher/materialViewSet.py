from rest_framework import viewsets, generics, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.http import Http404
from pramlearnapp.models import Material, Subject, StudentActivity
from pramlearnapp.serializers import MaterialSerializer, MaterialDetailSerializer
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from rest_framework.exceptions import ValidationError


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'

    def perform_create(self, serializer):
        subject_id = self.kwargs.get(
            'subject_id') or self.request.data.get('subject')
        if not subject_id:
            raise ValidationError("subject_id wajib diisi")
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
        # Gunakan serializer detail jika ada slug di query param
        if self.action == "retrieve":
            return MaterialDetailSerializer
        if self.request and self.request.query_params.get("slug"):
            return MaterialDetailSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        queryset = super().get_queryset()
        slug = self.request.query_params.get("slug")
        if slug:
            queryset = queryset.filter(slug=slug)
        # Prefetch quizzes dan assignments jika slug ada
        if slug:
            queryset = queryset.prefetch_related("quizzes", "assignments")
        return queryset


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

    def get_object(self):
        return Material.objects.select_related('subject').prefetch_related(
            'pdf_files',
            'youtube_videos',
            'quizzes',
            'assignments',
            'assignments__assignmentsubmission_set'  # Prefetch submissions
        ).get(slug=self.kwargs['slug'])

    # def get_object(self):
    #     return Material.objects.select_related('subject').prefetch_related(
    #         'pdf_files', 'youtube_videos', 'quizzes', 'assignments'
    #     ).get(slug=self.kwargs['slug'])


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
