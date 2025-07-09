from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Q, Prefetch
from django.utils import timezone
from datetime import timedelta
from pramlearnapp.models import (
    Material,
    Subject,
    Quiz,
    Assignment,
    Group,
    GroupMember,
    GroupQuiz,
    GroupQuizSubmission,
    ClassStudent,
    SubjectClass,
    CustomUser,
    StudentAttendance,
    AssignmentSubmission,
    StudentMaterialProgress,
    File,
    MaterialYoutubeVideo,
    StudentMotivationProfile,
)
from pramlearnapp.permissions import IsTeacherUser
from rest_framework.permissions import IsAuthenticated


class TeacherSessionMaterialDetailView(APIView):
    """
    API untuk mendapatkan detail material dalam context sessions
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, material_slug):
        try:
            # Get material
            material = get_object_or_404(Material, slug=material_slug)

            # Get related data
            groups = Group.objects.filter(material=material).prefetch_related(
                "groupmember_set__student"
            )
            quizzes = Quiz.objects.filter(material=material).prefetch_related(
                "questions"
            )
            assignments = Assignment.objects.filter(material=material)

            # Get students in the material's class
            subject_class = material.subject.subject_class
            class_obj = subject_class.class_id

            # --- GANTI INI ---
            # students_data = []
            # for student in class_students:
            #     ...
            #     students_data.append({...})

            # Pakai method yang benar:
            students_data = self.get_students_data(class_obj, material)

            # Prepare groups data
            groups_data = []
            for group in groups:
                members = []
                for member in group.groupmember_set.all():
                    student = member.student
                    members.append(
                        {
                            "id": student.id,
                            "username": student.username,
                            "first_name": student.first_name,
                            "last_name": student.last_name,
                        }
                    )

                quiz_count = GroupQuiz.objects.filter(group=group).count()

                groups_data.append(
                    {
                        "id": group.id,
                        "name": group.name,
                        "code": group.code,
                        "members": members,
                        "member_count": len(members),
                        "quiz_count": quiz_count,
                    }
                )

            # Calculate statistics
            total_students = len(students_data)
            present_students = len(
                [s for s in students_data if s["attendance_status"] == "present"]
            )
            attendance_rate = (
                (present_students / total_students * 100) if total_students > 0 else 0
            )
            average_progress = (
                sum(s["completion_percentage"] for s in students_data) / total_students
                if total_students > 0
                else 0
            )

            response_data = {
                "material": {
                    "id": material.id,
                    "title": material.title,
                    "slug": material.slug,
                    "created_at": material.created_at,
                    "updated_at": material.updated_at,
                    "subject": {
                        "id": material.subject.id,
                        "name": material.subject.name,
                        "slug": material.subject.slug,
                    },
                    "class": {
                        "id": subject_class.class_id.id,
                        "name": subject_class.class_id.name,
                    },
                },
                "content": {
                    "pdf_files": [
                        {
                            "id": pdf.id,
                            "file": pdf.file.url,
                            "name": pdf.file.name.split("/")[-1],
                            "uploaded_at": pdf.uploaded_at,
                        }
                        for pdf in material.pdf_files.all()
                    ],
                    "youtube_videos": [
                        {
                            "id": video.id,
                            "url": video.url,
                        }
                        for video in material.youtube_videos.all()
                    ],
                    # "google_form_embed_arcs_awal": material.google_form_embed_arcs_awal,
                    # "google_form_embed_arcs_akhir": material.google_form_embed_arcs_akhir,
                },
                "students": students_data,
                "groups": groups_data,
                "quizzes": [],  # Add quiz data if needed
                "assignments": [],  # Add assignment data if needed
                "statistics": {
                    "total_students": total_students,
                    "attendance_rate": round(attendance_rate, 1),
                    "average_progress": round(average_progress),
                    "content_stats": {
                        "pdf_files": material.pdf_files.count(),
                        "videos": material.youtube_videos.count(),
                        "quizzes": quizzes.count(),
                        "assignments": assignments.count(),
                        "groups": groups.count(),
                    },
                },
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Terjadi kesalahan: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def get_material_content(self, material):
        """Get material content (files, videos, forms)"""
        # PDF Files
        pdf_files = []
        for file in material.pdf_files.all():
            pdf_files.append(
                {
                    "id": file.id,
                    "file": file.file.url if file.file else None,
                    "name": file.file.name.split("/")[-1] if file.file else "Unknown",
                    "uploaded_at": file.uploaded_at,
                }
            )

        # YouTube Videos
        youtube_videos = []
        for video in material.youtube_videos.all():
            youtube_videos.append({"id": video.id, "url": video.url})

        return {
            "pdf_files": pdf_files,
            "youtube_videos": youtube_videos,
            # "google_form_embed_arcs_awal": material.google_form_embed_arcs_awal,
            # "google_form_embed_arcs_akhir": material.google_form_embed_arcs_akhir,
        }

    def get_students_data(self, class_obj, material):
        class_students = (
            ClassStudent.objects.filter(class_id=class_obj)
            .select_related("student")
            .order_by("student__first_name", "student__last_name")
        )
        students_dict = {}
        for cs in class_students:
            student = cs.student

            # Ambil status kehadiran terbaru dari StudentAttendance
            attendance = StudentAttendance.objects.filter(
                material=material, student=student
            ).first()
            attendance_status = attendance.status if attendance else "absent"

            # Ambil progress (jika ada)
            try:
                progress = StudentMaterialProgress.objects.get(
                    student=student, material=material
                )
                completion_percentage = progress.completion_percentage
            except StudentMaterialProgress.DoesNotExist:
                completion_percentage = 0.0

            # Ambil motivation profile (jika ada)
            motivation_level = None
            if hasattr(student, "studentmotivationprofile"):
                motivation_level = student.studentmotivationprofile.motivation_level

            # Gunakan dict agar id unik
            students_dict[student.id] = {
                "id": student.id,
                "username": student.username,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "email": student.email,
                "attendance_status": attendance_status,
                "completion_percentage": completion_percentage,
                "motivation_level": motivation_level,
                "is_online": student.is_online,
            }

        # Kembalikan hanya satu entri per siswa
        return list(students_dict.values())

    def get_groups_data(self, material):
        """Get groups data with members"""
        groups = Group.objects.filter(material=material).prefetch_related(
            "groupmember_set__student"
        )

        groups_data = []
        for group in groups:
            members = []
            for member in group.groupmember_set.all():
                student = member.student
                members.append(
                    {
                        "id": student.id,
                        "username": student.username,
                        "first_name": student.first_name,
                        "last_name": student.last_name,
                    }
                )

            # Get group quiz count
            quiz_count = GroupQuiz.objects.filter(group=group).count()

            groups_data.append(
                {
                    "id": group.id,
                    "name": group.name,
                    "code": group.code,
                    "members": members,
                    "member_count": len(members),
                    "quiz_count": quiz_count,
                }
            )

        return groups_data

    def get_quizzes_data(self, material):
        """Get quizzes data"""
        quizzes = Quiz.objects.filter(material=material).prefetch_related(
            "questions", "groupquiz_set"
        )

        quizzes_data = []
        for quiz in quizzes:
            # Get assigned groups
            assigned_groups = GroupQuiz.objects.filter(quiz=quiz).count()

            # Get completion stats
            total_submissions = (
                GroupQuizSubmission.objects.filter(group_quiz__quiz=quiz)
                .values("group_quiz")
                .distinct()
                .count()
            )

            quizzes_data.append(
                {
                    "id": quiz.id,
                    "title": quiz.title,
                    "content": quiz.content,
                    "created_at": quiz.created_at,
                    "question_count": quiz.questions.count(),
                    "assigned_groups": assigned_groups,
                    "completed_submissions": total_submissions,
                    "is_group_quiz": quiz.is_group_quiz,
                }
            )

        return quizzes_data

    def get_assignments_data(self, material):
        """Get assignments data"""
        assignments = Assignment.objects.filter(material=material).prefetch_related(
            "questions", "assignmentsubmission_set"
        )

        assignments_data = []
        for assignment in assignments:
            # Get submission stats
            total_submissions = assignment.assignmentsubmission_set.count()
            graded_submissions = assignment.assignmentsubmission_set.filter(
                grade__isnull=False
            ).count()

            assignments_data.append(
                {
                    "id": assignment.id,
                    "title": assignment.title,
                    "description": assignment.description,
                    "due_date": assignment.due_date,
                    "created_at": assignment.created_at,
                    "question_count": assignment.questions.count(),
                    "total_submissions": total_submissions,
                    "graded_submissions": graded_submissions,
                }
            )

        return assignments_data

    def get_material_statistics(self, material, class_obj):
        """Get material statistics"""
        # Total students
        total_students = ClassStudent.objects.filter(class_id=class_obj).count()

        # Attendance stats
        attendance_present = StudentAttendance.objects.filter(
            material=material, status="present"
        ).count()

        attendance_rate = (
            (attendance_present / total_students * 100) if total_students > 0 else 0
        )

        # Progress stats
        progress_records = StudentMaterialProgress.objects.filter(material=material)
        avg_progress = (
            progress_records.aggregate(avg=Avg("completion_percentage"))["avg"] or 0
        )

        # Content stats
        pdf_count = material.pdf_files.count()
        video_count = material.youtube_videos.count()
        quiz_count = Quiz.objects.filter(material=material).count()
        assignment_count = Assignment.objects.filter(material=material).count()
        group_count = Group.objects.filter(material=material).count()

        return {
            "total_students": total_students,
            "attendance_rate": round(attendance_rate, 1),
            "average_progress": round(avg_progress, 1),
            "content_stats": {
                "pdf_files": pdf_count,
                "videos": video_count,
                "quizzes": quiz_count,
                "assignments": assignment_count,
                "groups": group_count,
            },
        }


class TeacherSessionMaterialContentView(APIView):
    """
    API untuk mendapatkan konten material (untuk tab content)
    """

    permission_classes = [IsAuthenticated, IsTeacherUser]

    def get(self, request, material_slug):
        teacher = request.user

        try:
            material = get_object_or_404(Material, slug=material_slug)

            # Verify teacher access
            SubjectClass.objects.get(subject=material.subject, teacher=teacher)

            # Get detailed content
            content_data = {
                "basic_info": {
                    "id": material.id,
                    "title": material.title,
                    "created_at": material.created_at,
                    "updated_at": material.updated_at,
                },
                "pdf_files": self.get_pdf_files(material),
                "youtube_videos": self.get_youtube_videos(material),
                # "google_forms": {
                #     "arcs_awal": material.google_form_embed_arcs_awal,
                #     "arcs_akhir": material.google_form_embed_arcs_akhir,
                # },
            }

            return Response(content_data, status=status.HTTP_200_OK)

        except Material.DoesNotExist:
            return Response(
                {"error": "Material tidak ditemukan"}, status=status.HTTP_404_NOT_FOUND
            )
        except SubjectClass.DoesNotExist:
            return Response(
                {"error": "Anda tidak memiliki akses ke material ini"},
                status=status.HTTP_403_FORBIDDEN,
            )

    def get_pdf_files(self, material):
        """Get detailed PDF files info"""
        files = []
        for file in material.pdf_files.all():
            file_size = 0
            try:
                if file.file:
                    file_size = file.file.size
            except:
                file_size = 0

            files.append(
                {
                    "id": file.id,
                    "name": file.file.name.split("/")[-1] if file.file else "Unknown",
                    "url": file.file.url if file.file else None,
                    "size": file_size,
                    "uploaded_at": file.uploaded_at,
                }
            )

        return files

    def get_youtube_videos(self, material):
        """Get YouTube videos with embed URLs"""
        videos = []
        for video in material.youtube_videos.all():
            embed_url = self.get_youtube_embed_url(video.url)
            videos.append({"id": video.id, "url": video.url, "embed_url": embed_url})

        return videos

    def get_youtube_embed_url(self, url):
        """Convert YouTube URL to embed URL"""
        if not url:
            return None

        # Extract video ID from various YouTube URL formats
        video_id = None
        if "youtube.com/watch?v=" in url:
            video_id = url.split("v=")[1].split("&")[0]
        elif "youtu.be/" in url:
            video_id = url.split("youtu.be/")[1].split("?")[0]
        elif "youtube.com/embed/" in url:
            video_id = url.split("embed/")[1].split("?")[0]

        if video_id:
            return f"https://www.youtube.com/embed/{video_id}"

        return url


class TeacherSessionMaterialAttendanceView(APIView):
    permission_classes = [IsTeacherUser]

    def post(self, request, material_slug, student_id):
        status_value = request.data.get("status")
        if status_value not in ["present", "late", "excused", "absent"]:
            return Response({"error": "Invalid status"}, status=400)

        try:
            material = Material.objects.get(slug=material_slug)
            student = CustomUser.objects.get(id=student_id)
        except (Material.DoesNotExist, CustomUser.DoesNotExist):
            return Response({"error": "Material or student not found"}, status=404)

        attendance, _ = StudentAttendance.objects.get_or_create(
            material=material, student=student
        )
        attendance.status = status_value
        attendance.save()

        return Response({"success": True, "status": attendance.status})

    def get(self, request, material_slug):
        material = Material.objects.get(slug=material_slug)
        students = CustomUser.objects.filter(class_id=material.class_id, role=3)
        student_data = []
        for student in students:
            attendance = StudentAttendance.objects.filter(
                material=material, student=student
            ).first()
            attendance_status = attendance.status if attendance else "absent"
            student_data.append(
                {
                    "id": student.id,
                    "username": student.username,
                    # ...field lain...
                    "attendance_status": attendance_status,
                }
            )
