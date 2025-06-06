from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from django.shortcuts import get_object_or_404
from pramlearnapp.models import Material, StudentMaterialProgress, StudentMaterialBookmark, StudentMaterialActivity
from pramlearnapp.serializers import StudentMaterialProgressSerializer, StudentMaterialBookmarkSerializer

import logging
logger = logging.getLogger(__name__)


class StudentMaterialProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, material_id):
        """Get student progress for specific material"""
        try:
            material = get_object_or_404(Material, id=material_id)
            progress, created = StudentMaterialProgress.objects.get_or_create(
                student=request.user,
                material=material,
                defaults={'completion_percentage': 0.0}
            )

            serializer = StudentMaterialProgressSerializer(progress)
            return Response(serializer.data)

        except Material.DoesNotExist:
            return Response({'error': 'Material not found'}, status=404)

    def put(self, request, material_id):
        logger.info(f"DEBUG PUT DATA: {request.data}")
        """Update student progress"""
        try:
            material = get_object_or_404(Material, id=material_id)
            progress, created = StudentMaterialProgress.objects.get_or_create(
                student=request.user,
                material=material,
                defaults={'completion_percentage': 0.0}
            )

            # Update progress
            if 'completion_percentage' in request.data:
                completion_percentage = request.data.get(
                    'completion_percentage')
                progress.completion_percentage = min(
                    100.0, max(0.0, float(completion_percentage)))
            # else: jangan ubah progress.completion_percentage

            if 'time_spent' in request.data:
                progress.time_spent = max(
                    0, int(request.data.get('time_spent')))
            if 'last_position' in request.data:
                progress.last_position = int(request.data.get('last_position'))

            # Mark sebagai completed jika 100%
            if progress.completion_percentage >= 100 and not progress.completed_at:
                progress.completed_at = timezone.now()

            progress.save()

            serializer = StudentMaterialProgressSerializer(progress)
            return Response(serializer.data)

        except Material.DoesNotExist:
            return Response({'error': 'Material not found'}, status=404)
        except (ValueError, TypeError) as e:
            return Response({'error': f'Invalid data: {str(e)}'}, status=400)


class StudentMaterialBookmarkView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, material_id):
        """Get all bookmarks for material"""
        try:
            material = get_object_or_404(Material, id=material_id)
            bookmarks = StudentMaterialBookmark.objects.filter(
                student=request.user,
                material=material
            ).order_by('created_at')

            serializer = StudentMaterialBookmarkSerializer(
                bookmarks, many=True)
            return Response(serializer.data)

        except Material.DoesNotExist:
            return Response({'error': 'Material not found'}, status=404)

    def post(self, request, material_id):
        """Create new bookmark"""
        try:
            material = get_object_or_404(Material, id=material_id)

            # Check if bookmark already exists
            existing = StudentMaterialBookmark.objects.filter(
                student=request.user,
                material=material,
                content_type=request.data.get('content_type'),
                position=request.data.get('position', 0)
            ).first()

            if existing:
                return Response({'error': 'Bookmark already exists'}, status=400)

            # Create new bookmark
            bookmark_data = {
                'student': request.user.id,
                'material': material.id,
                'title': request.data.get('title', ''),
                'content_type': request.data.get('content_type', ''),
                'position': request.data.get('position', 0),
                'description': request.data.get('description', ''),
            }

            serializer = StudentMaterialBookmarkSerializer(data=bookmark_data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=201)
            else:
                return Response(serializer.errors, status=400)

        except Material.DoesNotExist:
            return Response({'error': 'Material not found'}, status=404)

    def delete(self, request, material_id, bookmark_id):
        """Delete bookmark"""
        try:
            material = get_object_or_404(Material, id=material_id)
            bookmark = get_object_or_404(
                StudentMaterialBookmark,
                id=bookmark_id,
                student=request.user,
                material=material
            )

            bookmark.delete()
            return Response({'message': 'Bookmark deleted successfully'}, status=204)

        except Material.DoesNotExist:
            return Response({'error': 'Material not found'}, status=404)
        except StudentMaterialBookmark.DoesNotExist:
            return Response({'error': 'Bookmark not found'}, status=404)


class StudentMaterialAccessView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, material_id):
        """Record material access"""
        try:
            material = get_object_or_404(Material, id=material_id)

            # Record access (bisa ditambahkan ke model StudentActivity jika diperlukan)
            # Untuk sekarang hanya return success
            return Response({'message': 'Access recorded'}, status=200)

        except Material.DoesNotExist:
            return Response({'error': 'Material not found'}, status=404)


class StudentMaterialActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, material_id):
        """Get completed activities for material"""
        try:
            material = get_object_or_404(Material, id=material_id)
            activities = StudentMaterialActivity.objects.filter(
                student=request.user,
                material=material
            )

            activity_data = [
                {
                    'activity_type': activity.activity_type,
                    'content_index': activity.content_index,
                    'completed_at': activity.completed_at
                }
                for activity in activities
            ]

            return Response(activity_data)

        except Material.DoesNotExist:
            return Response({'error': 'Material not found'}, status=404)

    def post(self, request, material_id):
        """Record new activity completion"""
        try:
            material = get_object_or_404(Material, id=material_id)

            activity, created = StudentMaterialActivity.objects.get_or_create(
                student=request.user,
                material=material,
                activity_type=request.data.get('activity_type'),
                content_index=request.data.get('content_index', 0),
                defaults={'content_id': request.data.get('content_id', '')}
            )

            if created:
                return Response({'message': 'Activity recorded'}, status=201)
            else:
                return Response({'message': 'Activity already exists'}, status=200)

        except Material.DoesNotExist:
            return Response({'error': 'Material not found'}, status=404)
