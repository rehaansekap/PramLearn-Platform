from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from django.shortcuts import get_object_or_404
from pramlearnapp.models import Material, StudentMaterialProgress, StudentMaterialBookmark, StudentMaterialActivity
from pramlearnapp.models.group import GroupMember
from pramlearnapp.models.assignment import AssignmentSubmission
from pramlearnapp.serializers import StudentMaterialProgressSerializer, StudentMaterialBookmarkSerializer

from django.core.cache import cache
import time

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

            # Hitung ulang progress setiap GET
            total_completion = self.calculate_total_completion(
                request.user, material)

            # Update jika berbeda
            if abs(progress.completion_percentage - total_completion) > 0.1:
                progress.completion_percentage = min(100.0, total_completion)
                progress.save()

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

            # ✅ HITUNG REAL COMPLETION DARI BACKEND DULU
            real_completion = self.calculate_total_completion(
                request.user, material)

            # Update progress hanya jika ada perubahan yang valid
            if 'completion_percentage' in request.data:
                requested_percentage = float(
                    request.data.get('completion_percentage'))
                # ✅ GUNAKAN YANG LEBIH TINGGI ANTARA FRONTEND DAN BACKEND
                progress.completion_percentage = max(
                    real_completion, min(100.0, requested_percentage))
            else:
                # ✅ SELALU UPDATE KE REAL COMPLETION
                progress.completion_percentage = real_completion

            if 'time_spent' in request.data:
                progress.time_spent = max(
                    0, int(request.data.get('time_spent')))

            if 'last_position' in request.data:
                progress.last_position = int(request.data.get('last_position'))

            # Mark sebagai completed jika 100%
            if progress.completion_percentage >= 100 and not progress.completed_at:
                progress.completed_at = timezone.now()
                logger.info(
                    f"🎉 Material {material.title} marked as completed for {request.user.username}")

            progress.save()

            serializer = StudentMaterialProgressSerializer(progress)
            return Response(serializer.data)

        except Material.DoesNotExist:
            return Response({'error': 'Material not found'}, status=404)
        except (ValueError, TypeError) as e:
            return Response({'error': f'Invalid data: {str(e)}'}, status=400)

    def calculate_total_completion(self, user, material):
        """Calculate total completion including quizzes and assignments"""

        # 1. Hitung base completion dari activities
        base_activities = StudentMaterialActivity.objects.filter(
            student=user,
            material=material
        ).count()

        # 2. Hitung total komponen yang ada
        total_pdfs = material.pdf_files.count()
        total_videos = material.youtube_videos.filter(
            url__isnull=False).exclude(url='').count()
        total_quizzes = material.quizzes.count()
        total_assignments = material.assignments.count()

        total_components = total_pdfs + total_videos + total_quizzes + total_assignments

        if total_components == 0:
            return 0.0

        completed_components = 0

        # 3. Hitung PDF yang sudah dibuka
        pdf_activities = StudentMaterialActivity.objects.filter(
            student=user,
            material=material,
            activity_type='pdf_opened'
        ).count()
        completed_components += min(pdf_activities, total_pdfs)

        # 4. Hitung Video yang sudah diplay
        video_activities = StudentMaterialActivity.objects.filter(
            student=user,
            material=material,
            activity_type='video_played'
        ).count()
        completed_components += min(video_activities, total_videos)

        # 5. Hitung Quiz yang sudah selesai
        completed_quizzes = 0
        for quiz in material.quizzes.all():
            if quiz.is_group_quiz:
                # Group quiz - cek GroupQuiz.is_completed
                user_group = GroupMember.objects.filter(
                    student=user,
                    group__material=material
                ).first()

                if user_group:
                    from pramlearnapp.models.group import GroupQuiz
                    group_quiz = GroupQuiz.objects.filter(
                        quiz=quiz,
                        group=user_group.group,
                        is_completed=True
                    ).exists()

                    if group_quiz:
                        completed_quizzes += 1
            else:
                # Individual quiz - cek StudentQuizAttempt.submitted_at
                from pramlearnapp.models.quiz import StudentQuizAttempt
                attempt = StudentQuizAttempt.objects.filter(
                    student=user,
                    quiz=quiz,
                    submitted_at__isnull=False
                ).exists()

                if attempt:
                    completed_quizzes += 1

        completed_components += completed_quizzes

        # 6. Hitung Assignment yang sudah submit
        completed_assignments = AssignmentSubmission.objects.filter(
            student=user,
            assignment__material=material,
            is_draft=False  # Sudah di-submit, bukan draft
        ).count()

        completed_components += completed_assignments

        # 7. Hitung persentase
        completion_percentage = (completed_components / total_components) * 100

        logger.info(
            f"📊 Progress calculation for user {user.username}, material {material.title}:")
        logger.info(
            f"   - Total components: {total_components} (PDF: {total_pdfs}, Video: {total_videos}, Quiz: {total_quizzes}, Assignment: {total_assignments})")
        logger.info(
            f"   - Completed: {completed_components} (Quiz: {completed_quizzes}, Assignment: {completed_assignments})")
        logger.info(f"   - Percentage: {completion_percentage:.1f}%")

        return completion_percentage


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
        try:
            material = get_object_or_404(Material, id=material_id)
            activity_type = request.data.get("activity_type")
            content_index = request.data.get("content_index")
            quiz_id = request.data.get("quiz_id")
            assignment_id = request.data.get("assignment_id")

            # ✅ TAMBAHAN: Cek apakah material sudah 100% completed
            progress, created = StudentMaterialProgress.objects.get_or_create(
                student=request.user,
                material=material,
                defaults={'completion_percentage': 0.0}
            )

            # Hitung real progress dari backend
            progress_view = StudentMaterialProgressView()
            real_completion = progress_view.calculate_total_completion(
                request.user, material)

            # Jika sudah 100%, blokir aktivitas PDF/video baru
            if real_completion >= 100 and activity_type in ['pdf_opened', 'video_played']:
                logger.info(
                    f"🚫 Blocking {activity_type} - Material already 100% completed")
                return Response({"detail": "Material already completed."}, status=409)

            # ✅ QUIZ COMPLETION HANDLING
            if activity_type == "quiz_completed" and quiz_id:
                from pramlearnapp.models.quiz import Quiz, StudentQuizAttempt
                from pramlearnapp.models.group import GroupQuiz, GroupMember

                quiz = Quiz.objects.filter(id=quiz_id).first()
                if not quiz:
                    return Response({"detail": "Quiz not found."}, status=404)

                # Cek apakah sudah ada record activity untuk quiz ini
                existing_activity = StudentMaterialActivity.objects.filter(
                    student=request.user,
                    material=material,
                    activity_type='quiz_completed',
                    content_id=f"quiz_completed_{quiz_id}"
                ).first()

                if existing_activity:
                    logger.info(f"🚫 Quiz {quiz_id} activity already recorded")
                    return Response({"detail": "Quiz activity already recorded."}, status=409)

                # Validasi apakah quiz benar-benar sudah completed
                is_completed = False
                if quiz.is_group_quiz:
                    user_group = GroupMember.objects.filter(
                        student=request.user,
                        group__material=material
                    ).first()
                    if user_group:
                        group_quiz = GroupQuiz.objects.filter(
                            quiz=quiz,
                            group=user_group.group,
                            is_completed=True
                        ).first()
                        if group_quiz:
                            is_completed = True
                else:
                    attempt = StudentQuizAttempt.objects.filter(
                        student=request.user,
                        quiz=quiz,
                        submitted_at__isnull=False
                    ).first()
                    if attempt:
                        is_completed = True

                if not is_completed:
                    return Response({"detail": "Quiz not completed yet."}, status=400)

                # ✅ BUAT ACTIVITY RECORD UNTUK QUIZ
                StudentMaterialActivity.objects.create(
                    student=request.user,
                    material=material,
                    activity_type='quiz_completed',
                    content_index=quiz_id,  # Gunakan quiz_id sebagai content_index
                    content_id=f"quiz_completed_{quiz_id}"
                )
                logger.info(
                    f"✅ Quiz completion activity recorded: quiz_{quiz_id}")
                return Response({"detail": "Quiz completion recorded."}, status=201)

            # ✅ ASSIGNMENT SUBMISSION HANDLING
            if activity_type == "assignment_submitted" and assignment_id:
                from pramlearnapp.models.assignment import AssignmentSubmission

                # Cek apakah sudah ada record activity untuk assignment ini
                existing_activity = StudentMaterialActivity.objects.filter(
                    student=request.user,
                    material=material,
                    activity_type='assignment_submitted',
                    content_id=f"assignment_submitted_{assignment_id}"
                ).first()

                if existing_activity:
                    logger.info(
                        f"🚫 Assignment {assignment_id} activity already recorded")
                    return Response({"detail": "Assignment activity already recorded."}, status=409)

                # Validasi apakah assignment benar-benar sudah disubmit
                submission = AssignmentSubmission.objects.filter(
                    student=request.user,
                    assignment_id=assignment_id,
                    is_draft=False
                ).first()

                if not submission:
                    return Response({"detail": "Assignment not submitted yet."}, status=400)

                # ✅ BUAT ACTIVITY RECORD UNTUK ASSIGNMENT
                StudentMaterialActivity.objects.create(
                    student=request.user,
                    material=material,
                    activity_type='assignment_submitted',
                    content_index=assignment_id,  # Gunakan assignment_id sebagai content_index
                    content_id=f"assignment_submitted_{assignment_id}"
                )
                logger.info(
                    f"✅ Assignment submission activity recorded: assignment_{assignment_id}")
                return Response({"detail": "Assignment submission recorded."}, status=201)

            # ✅ PDF/VIDEO HANDLING (yang sudah ada sebelumnya)
            if activity_type in ['pdf_opened', 'video_played'] and content_index is not None:
                existing_activity = StudentMaterialActivity.objects.filter(
                    student=request.user,
                    material=material,
                    activity_type=activity_type,
                    content_index=content_index
                ).first()

                if existing_activity:
                    logger.info(
                        f"🚫 Activity {activity_type}_{content_index} already exists")
                    return Response({"detail": f"{activity_type} already recorded."}, status=409)

                # Buat record baru
                StudentMaterialActivity.objects.create(
                    student=request.user,
                    material=material,
                    activity_type=activity_type,
                    content_index=content_index,
                    content_id=f"{activity_type}_{content_index}"
                )
                logger.info(
                    f"✅ New activity recorded: {activity_type}_{content_index}")
                return Response({"detail": "Activity recorded."}, status=201)

            # Jika tidak ada activity_type yang valid
            return Response({"detail": "Invalid activity type or missing parameters."}, status=400)

        except Material.DoesNotExist:
            return Response({'error': 'Material not found'}, status=404)
        except Exception as e:
            logger.error(f"Error recording activity: {e}")
            return Response({"detail": str(e)}, status=400)
