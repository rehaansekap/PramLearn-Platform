from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Avg, Count, Q, Min, Max
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from datetime import datetime, timedelta
from ...models import Grade, GradeStatistics, Achievement, AssignmentSubmission, AssignmentAnswer, Assignment, StudentQuizAttempt, StudentQuizAnswer, GroupQuiz, GroupQuizSubmission, GroupMember, Quiz, GroupQuizSubmission
from pramlearnapp.serializers import (
    GradeSerializer,
    GradeStatisticsSerializer,
    AchievementSerializer,
    StudentGradeAnalyticsSerializer
)
from ...services.gradeService import GradeService
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO
import datetime
import logging

logger = logging.getLogger(__name__)


class StudentGradeView(APIView):
    """
    API untuk mengambil grades siswa dengan filtering & sorting
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            
            user = request.user
            is_student = False

            # Debug logging
            logger.info(
                f"User: {user.username}, Role object: {user.role}, Role type: {type(user.role)}")

            if hasattr(user, 'role'):
                # Jika role adalah objek Role dengan attribute name
                if hasattr(user.role, 'name'):
                    is_student = user.role.name.lower() == 'student'
                    logger.info(
                        f"Role name: {user.role.name}, is_student: {is_student}")
                # Jika role adalah integer langsung
                elif isinstance(user.role, int):
                    is_student = user.role == 3
                    logger.info(
                        f"Role integer: {user.role}, is_student: {is_student}")
                # Jika role adalah objek dengan id
                elif hasattr(user.role, 'id'):
                    is_student = user.role.id == 3
                    logger.info(
                        f"Role id: {user.role.id}, is_student: {is_student}")

            if not is_student:
                return Response(
                    {'error': 'Only students can access grades'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get atau create grade statistics
            grade_stats, created = GradeStatistics.objects.get_or_create(
                student=request.user
            )
            if created:
                grade_stats.update_statistics()

            # Get grades dengan filtering
            grades = Grade.objects.filter(student=request.user)

            # Apply filters
            subject_filter = request.GET.get('subject_id')
            type_filter = request.GET.get('type')
            date_from = request.GET.get('date_from')
            date_to = request.GET.get('date_to')

            if subject_filter:
                grades = grades.filter(
                    Q(assignment__material__subject_id=subject_filter) |
                    Q(quiz__material__subject_id=subject_filter) |
                    Q(material__subject_id=subject_filter)
                )

            if type_filter and type_filter in ['quiz', 'assignment', 'material']:
                grades = grades.filter(type=type_filter)

            if date_from:
                try:
                    date_from_parsed = datetime.strptime(date_from, '%Y-%m-%d')
                    grades = grades.filter(date__gte=date_from_parsed)
                except ValueError:
                    pass

            if date_to:
                try:
                    date_to_parsed = datetime.strptime(date_to, '%Y-%m-%d')
                    grades = grades.filter(date__lte=date_to_parsed)
                except ValueError:
                    pass

            # Sorting
            grades = grades.order_by('-date')

            # Serialize data
            grade_serializer = GradeSerializer(grades, many=True)
            stats_serializer = GradeStatisticsSerializer(grade_stats)

            return Response({
                'grades': grade_serializer.data,
                'statistics': stats_serializer.data,
                'total_count': grades.count()
            })

        except Exception as e:
            logger.error(f"Error in StudentGradeView: {str(e)}")
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StudentGradeAnalyticsView(APIView):
    """
    API untuk analytics grade siswa yang lebih detail
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            
            user = request.user
            is_student = False

            if hasattr(user, 'role'):
                if hasattr(user.role, 'name'):
                    is_student = user.role.name.lower() == 'student'
                elif isinstance(user.role, int):
                    is_student = user.role == 3
                elif hasattr(user.role, 'id'):
                    is_student = user.role.id == 3

            if not is_student:
                return Response(
                    {'error': 'Only students can access grade analytics'},
                    status=status.HTTP_403_FORBIDDEN
                )

            grade_service = GradeService(request.user)
            analytics_data = grade_service.get_comprehensive_analytics()

            return Response(analytics_data)

        except Exception as e:
            logger.error(f"Error in StudentGradeAnalyticsView: {str(e)}")
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StudentAchievementView(APIView):
    """
    API untuk achievement/badges siswa
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            
            user = request.user
            is_student = False

            if hasattr(user, 'role'):
                if hasattr(user.role, 'name'):
                    is_student = user.role.name.lower() == 'student'
                elif isinstance(user.role, int):
                    is_student = user.role == 3
                elif hasattr(user.role, 'id'):
                    is_student = user.role.id == 3

            if not is_student:
                return Response(
                    {'error': 'Only students can access achievements'},
                    status=status.HTTP_403_FORBIDDEN
                )

            achievements = Achievement.objects.filter(student=request.user)
            serializer = AchievementSerializer(achievements, many=True)

            # Check for new achievements
            grade_service = GradeService(request.user)
            new_achievements = grade_service.check_and_award_achievements()

            return Response({
                'achievements': serializer.data,
                'new_achievements': new_achievements
            })

        except Exception as e:
            logger.error(f"Error in StudentAchievementView: {str(e)}")
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AssignmentFeedbackByGradeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, grade_id):
        """Get assignment feedback by grade ID"""
        download_format = request.GET.get('download')

        if download_format:
            return self.download_feedback(request, grade_id, download_format)

        try:
            # Get grade first
            grade = get_object_or_404(
                Grade,
                id=grade_id,
                student=request.user,
                type='assignment'
            )

            logger.info(
                f"Processing grade {grade_id} for user {request.user.id}")
            logger.info(
                f"Grade details: title={grade.title}, grade={grade.grade}, date={grade.date}")

            # PERBAIKAN: Cari jawaban dengan berbagai metode
            answers_data = []

            # Method 1: Cari berdasarkan assignment title matching
            if grade.title:
                try:
                    # Cari assignment berdasarkan title
                    possible_assignments = Assignment.objects.filter(
                        title__icontains=grade.title.replace(
                            'Tugas ', '').replace('Assignment ', '')
                    )

                    logger.info(
                        f"Found {possible_assignments.count()} possible assignments")

                    for assignment in possible_assignments:
                        submissions = AssignmentSubmission.objects.filter(
                            assignment=assignment,
                            student=request.user
                        ).order_by('-submission_date')
                        for submission in submissions:
                            answers = AssignmentAnswer.objects.filter(
                                submission=submission
                            ).select_related('question')

                            logger.info(
                                f"Found {answers.count()} answers for submission {submission.id}")

                            if answers.exists():
                                for answer in answers:
                                    question = answer.question
                                    answers_data.append({
                                        'id': answer.id,
                                        'question_text': question.text if question else 'Question not available',
                                        'question_id': question.id if question else None,
                                        'answer_text': getattr(answer, 'answer_text', None) or getattr(answer, 'essay_answer', None),
                                        'selected_choice': getattr(answer, 'selected_choice', None),
                                        'answer_type': 'multiple_choice' if getattr(answer, 'selected_choice', None) else 'essay',
                                        'teacher_feedback': getattr(answer, 'teacher_feedback', ''),
                                        'points_earned': getattr(answer, 'points_earned', None),
                                        'max_points': getattr(answer, 'max_points', 1),
                                        'is_correct': getattr(answer, 'is_correct', False),
                                    })

                                logger.info(
                                    f"Added {len(answers_data)} answers from assignment {assignment.id}")
                                break  # Stop after finding answers

                        if answers_data:
                            break  # Stop searching if we found answers

                except Exception as e:
                    logger.error(f"Error in method 1: {e}")

            # Safe field access untuk grade
            subject_name = getattr(grade, 'subject_name', None)
            material_title = getattr(grade, 'material_title', None)

            if not subject_name and hasattr(grade, 'subject'):
                subject_name = grade.subject.name if grade.subject else 'Unknown Subject'
            elif not subject_name:
                subject_name = 'Unknown Subject'

            if not material_title and hasattr(grade, 'material'):
                material_title = grade.material.title if grade.material else 'Unknown Material'
            elif not material_title:
                material_title = 'Unknown Material'

            # Create response data
            response_data = {
                'assignment': {
                    'title': getattr(grade, 'title', None) or 'Assignment',
                    'subject_name': subject_name,
                    'material_title': material_title,
                    'due_date': getattr(grade, 'date', None),
                    'description': 'Assignment details not available',
                },
                'submission': {
                    'submitted_at': getattr(grade, 'date', None),
                    'final_score': getattr(grade, 'grade', None),
                    'status': 'graded',
                    'is_late': False,
                },
                'grade': float(grade.grade) if grade.grade is not None else 0,
                'submission_date': getattr(grade, 'date', None),
                'graded_at': getattr(grade, 'date', None),
                'graded_by': 'Teacher',
                'teacher_feedback': getattr(grade, 'teacher_feedback', None) or 'No feedback available',
                'answers': answers_data,  # Sekarang berisi data jawaban yang ditemukan
                'submitted_files': [],
                'rubric_items': [],
                'improvement_suggestions': [],
                'grading_history': []
            }

            logger.info(f"Returning response with {len(answers_data)} answers")
            return Response(response_data)

        except Exception as e:
            logger.error(f"Error in AssignmentFeedbackByGradeView: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def download_feedback(self, request, grade_id, format_type='pdf'):
        """Download assignment feedback report"""
        try:
            # Get grade data
            grade = get_object_or_404(
                Grade,
                id=grade_id,
                student=request.user,
                type='assignment'
            )

            if format_type == 'pdf':
                return self.generate_pdf_report(grade, request.user)
            else:
                return self.generate_text_report(grade, request.user)

        except Exception as e:
            logger.error(f"Error generating report: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def generate_pdf_report(self, grade, user):
        """Generate PDF report using reportlab mirip modal AssignmentFeedback"""
        try:
            from reportlab.lib.enums import TA_CENTER, TA_LEFT
            buffer = BytesIO()
            doc = SimpleDocTemplate(
                buffer,
                pagesize=A4,
                rightMargin=36,
                leftMargin=36,
                topMargin=36,
                bottomMargin=24
            )
            styles = getSampleStyleSheet()
            story = []

            # --- HEADER: Ringkasan Pencapaian ---
            from reportlab.lib.colors import HexColor
            from reportlab.platypus import Table, TableStyle

            # Gradasi warna tidak bisa di reportlab, gunakan warna solid
            header_style = ParagraphStyle(
                "Header",
                parent=styles["Heading1"],
                fontSize=18,
                alignment=TA_CENTER,
                textColor=HexColor("#3a3f5c"),
                spaceAfter=12,
            )
            story.append(
                Paragraph("Assignment Feedback Report", header_style))
            story.append(Spacer(1, 8))

            # Assignment title & subject
            story.append(Paragraph(
                f'<b>{grade.title or "Assignment"}</b> - <font color="#888">{getattr(grade, "subject_name", "") or "Mata Pelajaran"}</font>',
                styles["Normal"]
            ))
            story.append(Spacer(1, 8))

            # Status badge
            nilai = float(grade.grade or 0)
            if nilai >= 85:
                badge = "🌟 Sangat Baik"
                badge_color = "#52c41a"
            elif nilai >= 70:
                badge = "👍 Baik"
                badge_color = "#faad14"
            else:
                badge = "📚 Perlu Perbaikan"
                badge_color = "#ff4d4f"

            badge_table = Table(
                [[Paragraph(
                    f'<font color="{badge_color}"><b>{badge}</b></font>', styles["Normal"])]],
                style=[
                    ("BACKGROUND", (0, 0), (-1, -1), HexColor("#f6ffed") if nilai >=
                        85 else HexColor("#fffbe6") if nilai >= 70 else HexColor("#fff1f0")),
                    ("BOX", (0, 0), (-1, -1), 1, HexColor(badge_color)),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ]
            )
            story.append(badge_table)
            story.append(Spacer(1, 12))

            # --- FEEDBACK KESELURUHAN ---
            feedback_text = getattr(
                grade, "teacher_feedback", None) or "No feedback available"
            feedback_color = "#fffbe6" if feedback_text == "No feedback available" else "#e6f7ff"
            feedback_icon = "💬" if feedback_text == "No feedback available" else "⭐"
            feedback_para = Paragraph(
                f'{feedback_icon} <b>Feedback Keseluruhan:</b><br/><font color="#888"><i>{feedback_text if feedback_text != "No feedback available" else "Belum ada feedback khusus dari guru untuk assignment ini."}</i></font>',
                styles["Normal"]
            )
            feedback_table = Table(
                [[feedback_para]],
                style=[
                    ("BACKGROUND", (0, 0), (-1, -1), HexColor(feedback_color)),
                    ("BOX", (0, 0), (-1, -1), 1, HexColor("#ffe58f")),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ]
            )
            story.append(feedback_table)
            story.append(Spacer(1, 16))

            # --- DETAIL PENILAIAN ASSIGNMENT (2 kolom) ---
            info_style = ParagraphStyle(
                "info", parent=styles["Normal"], fontSize=11, spaceAfter=4)
            # Kiri: Informasi Penilaian
            info_penilaian = [
                [Paragraph('<b>Informasi Penilaian</b>',
                           styles["BodyText"])],
                [Paragraph(
                    f'Nilai Akhir: <font color="#52c41a"><b>{nilai:.1f}/100</b></font>', info_style)],
                [Paragraph(
                    f'Grade: <b>{("A" if nilai >= 90 else "B" if nilai >= 80 else "C" if nilai >= 70 else "D" if nilai >= 60 else "E")}</b>', info_style)],
                [Paragraph(
                    'Status: <font color="#52c41a"><b>Sudah Dinilai</b></font>', info_style)],
            ]
            # Kanan: Timeline
            tgl_submit = grade.date.strftime(
                "%d %B %Y") if grade.date else "-"
            tgl_nilai = grade.date.strftime(
                "%d %B %Y") if grade.date else "-"
            timeline = [
                [Paragraph('<b>Timeline Assignment</b>',
                           styles["BodyText"])],
                [Paragraph(
                    f'Dikumpulkan: <b>{tgl_submit}</b>', info_style)],
                [Paragraph(f'Dinilai: <b>{tgl_nilai}</b>', info_style)],
                [Paragraph('Dinilai oleh: <b>Teacher</b>', info_style)],
            ]
            detail_table = Table(
                [[Table(info_penilaian), Table(timeline)]],
                colWidths=[240, 240],
                style=[
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ]
            )
            story.append(detail_table)
            story.append(Spacer(1, 16))

            # --- REVIEW JAWABAN ---
            # Ambil jawaban dari AssignmentAnswer jika ada
            answers = []
            try:
                possible_assignments = Assignment.objects.filter(
                    title__icontains=grade.title.replace(
                        'Tugas ', '').replace('Assignment ', '')
                )
                for assignment in possible_assignments:
                    submissions = AssignmentSubmission.objects.filter(
                        assignment=assignment,
                        student=user
                    ).order_by('-submission_date')
                    for submission in submissions:
                        answers_qs = AssignmentAnswer.objects.filter(
                            submission=submission
                        ).select_related('question')
                        if answers_qs.exists():
                            for answer in answers_qs:
                                answers.append(answer)
                            break
                    if answers:
                        break
            except Exception:
                pass

            if answers:
                story.append(
                    Paragraph('<b>Review Jawaban</b>', styles["BodyText"]))
                for idx, answer in enumerate(answers, 1):
                    q = answer.question
                    soal = q.text if q else "Soal tidak ditemukan"
                    jawaban = getattr(answer, "answer_text", None) or getattr(
                        answer, "essay_answer", None)
                    pilihan = getattr(answer, "selected_choice", None)
                    tipe = "Pilihan Ganda" if pilihan else "Essay"
                    benar = getattr(answer, "is_correct", False)
                    nilai_jawaban = getattr(answer, "points_earned", None)
                    nilai_maks = getattr(answer, "max_points", 1)
                    feedback_jawaban = getattr(
                        answer, "teacher_feedback", "")

                    # Box untuk setiap jawaban
                    jawaban_table = Table(
                        [
                            [Paragraph(
                                f"<b>Soal {idx}:</b> {soal}", info_style)],
                            [Paragraph(
                                f"<b>Tipe:</b> {tipe}", info_style)],
                            [Paragraph(
                                f"<b>Jawaban Anda:</b> {pilihan if pilihan else jawaban or '-'}", info_style)],
                            [Paragraph(
                                f"<b>Status:</b> {'Benar' if benar else 'Salah'}", info_style)],
                            [Paragraph(
                                f"<b>Poin:</b> {nilai_jawaban}/{nilai_maks}", info_style)],
                            [Paragraph(
                                f"<b>Komentar Guru:</b> {feedback_jawaban or '-'}", info_style)],
                        ],
                        style=[
                            ("BOX", (0, 0), (-1, -1), 1, HexColor("#d9d9d9")),
                            ("BACKGROUND", (0, 0),
                                (-1, -1), HexColor("#f9f9f9")),
                            ("LEFTPADDING", (0, 0), (-1, -1), 8),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                            ("TOPPADDING", (0, 0), (-1, -1), 4),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                        ]
                    )
                    story.append(jawaban_table)
                    story.append(Spacer(1, 8))
            else:
                # Jika tidak ada jawaban
                story.append(Spacer(1, 8))
                story.append(Paragraph(
                    '<b>Review Jawaban</b>', styles["BodyText"]))
                story.append(Paragraph(
                    '<font color="#888">Detail jawaban tidak tersedia untuk assignment ini.</font>', info_style))
                story.append(Paragraph(
                    '<font size=9 color="#888">Kemungkinan assignment dinilai manual, berupa upload file, atau sistem belum mencatat jawaban.</font>', info_style))
                story.append(Spacer(1, 8))

            # --- Saran Pengembangan ---
            if nilai >= 90:
                saran = [
                    "Selamat! Anda telah menunjukkan pemahaman yang sangat baik pada assignment ini.",
                    "Saran untuk langkah selanjutnya:",
                    "- Pertahankan konsistensi belajar yang sudah baik",
                    "- Bantu teman-teman yang membutuhkan bantuan",
                    "- Eksplorasi materi tambahan untuk memperdalam pemahaman"
                ]
                saran_color = "#f6ffed"
            elif nilai >= 75:
                saran = [
                    "Anda telah menunjukkan pemahaman yang cukup baik pada assignment ini.",
                    "Saran untuk perbaikan:",
                    "- Review kembali materi yang terkait dengan assignment",
                    "- Konsultasi dengan guru untuk klarifikasi konsep yang belum jelas",
                    "- Latihan soal tambahan untuk memperkuat pemahaman"
                ]
                saran_color = "#e6f7ff"
            else:
                saran = [
                    "Ada beberapa area yang perlu diperbaiki untuk assignment ini.",
                    "Langkah yang disarankan:",
                    "- Pelajari kembali materi dasar yang terkait",
                    "- Minta bantuan guru atau teman untuk penjelasan lebih detail",
                    "- Buat catatan ringkasan untuk memudahkan review",
                    "- Kerjakan latihan soal tambahan",
                    "- Jangan ragu untuk bertanya jika ada yang tidak dipahami"
                ]
                saran_color = "#fffbe6"
            saran_table = Table(
                [[Paragraph("<br/>".join(saran), info_style)]],
                style=[
                    ("BACKGROUND", (0, 0), (-1, -1), HexColor(saran_color)),
                    ("BOX", (0, 0), (-1, -1), 1, HexColor("#d9d9d9")),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ]
            )
            story.append(Spacer(1, 8))
            story.append(
                Paragraph('<b>💡 Saran Pengembangan</b>', styles["BodyText"]))
            story.append(saran_table)
            story.append(Spacer(1, 16))

            # --- Footer ---
            footer_style = ParagraphStyle(
                'Footer',
                parent=styles['Normal'],
                fontSize=9,
                textColor=colors.gray,
                alignment=TA_CENTER
            )
            story.append(Spacer(1, 20))
            story.append(
                Paragraph("Generated by PramLearn System", footer_style))
            story.append(Paragraph(
                f"Generated on {datetime.datetime.now().strftime('%d %B %Y at %H:%M')}", footer_style))

            doc.build(story)
            pdf_data = buffer.getvalue()
            buffer.close()
            response = HttpResponse(content_type='application/pdf')
            response[
                'Content-Disposition'] = f'attachment; filename="assignment-feedback-{grade.id}.pdf"'
            response.write(pdf_data)
            return response

        except Exception as e:
            logger.error(f"Error generating PDF: {e}")
            return self.generate_text_report(grade, user)


class QuizReviewView(APIView):
    """API untuk mendapatkan detail review quiz attempt"""
    permission_classes = [IsAuthenticated]

    def get(self, request, attempt_id):
        """Get quiz review details"""
        download_format = request.GET.get('format')

        if download_format:
            return self.download_quiz_report(request, attempt_id, download_format)

        try:
            # Import model yang diperlukan
            from pramlearnapp.models.group import GroupQuiz, GroupQuizSubmission, GroupMember, GroupQuizResult
            from pramlearnapp.models.quiz import Quiz, Question
            from pramlearnapp.models import Grade

            # PERBAIKAN: Coba cari data dengan berbagai cara
            attempt = None
            grade = None
            quiz = None
            is_group_quiz = False
            group_data = None

            # Method 1: Cari berdasarkan Grade dengan tipe quiz
            try:
                grade = get_object_or_404(
                    Grade,
                    id=attempt_id,
                    student=request.user,
                    type='quiz'
                )
                logger.info(f"Found Grade {attempt_id} with type quiz")

                # PERBAIKAN: Deteksi apakah ini group quiz berdasarkan title
                if grade.title and "group" in grade.title.lower():
                    is_group_quiz = True
                    logger.info("Detected as group quiz based on title")

                    # Cari quiz berdasarkan title matching
                    quiz_title_clean = grade.title.replace(
                        'Quiz ', '').replace('(Group)', '').strip()
                    possible_quiz = Quiz.objects.filter(
                        title__icontains=quiz_title_clean,
                        is_group_quiz=True
                    ).first()

                    if possible_quiz:
                        quiz = possible_quiz
                        logger.info(f"Found matching group quiz: {quiz.title}")

                        # Cari GroupMember untuk user ini
                        user_group_member = GroupMember.objects.filter(
                            student=request.user,
                            group__material=quiz.material
                        ).first()

                        if user_group_member:
                            # Build group_data
                            group_members = GroupMember.objects.filter(
                                group=user_group_member.group
                            ).select_related('student')

                            group_data = {
                                'id': user_group_member.group.id,
                                'name': user_group_member.group.name,
                                'code': user_group_member.group.code,
                                'members': [
                                    {
                                        'id': m.student.id,
                                        'name': f"{m.student.first_name} {m.student.last_name}".strip() or m.student.username,
                                        'username': m.student.username,
                                        'student_id': m.student.username,
                                        'is_current_user': m.student.id == request.user.id
                                    }
                                    for m in group_members
                                ]
                            }
                            logger.info(
                                f"Found group data: {group_data['name']} with {len(group_data['members'])} members")
                        else:
                            logger.warning(
                                "User not found in any group for this quiz material")
                else:
                    # Individual quiz
                    is_group_quiz = False
                    quiz_title_clean = grade.title.replace('Quiz ', '').strip()
                    possible_quiz = Quiz.objects.filter(
                        title__icontains=quiz_title_clean,
                        is_group_quiz=False
                    ).first()

                    if possible_quiz:
                        quiz = possible_quiz
                        logger.info(
                            f"Found matching individual quiz: {quiz.title}")

            except Exception as e:
                logger.error(f"Error finding grade: {e}")
                return Response(
                    {'error': f'No quiz data found with ID {attempt_id}'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Build questions data
            questions_data = []
            correct_count = 0
            incorrect_count = 0
            unanswered_count = 0

            if quiz and is_group_quiz:
                # PERBAIKAN: Untuk group quiz, ambil data dari GroupQuizSubmission
                try:
                    user_group_member = GroupMember.objects.filter(
                        student=request.user,
                        group__material=quiz.material
                    ).first()

                    if user_group_member:
                        group_quiz = GroupQuiz.objects.filter(
                            quiz=quiz,
                            group=user_group_member.group
                        ).first()

                        if group_quiz:
                            # Get submissions untuk group quiz ini
                            group_submissions = GroupQuizSubmission.objects.filter(
                                group_quiz=group_quiz
                            ).select_related('question', 'student')

                            # Get all questions untuk quiz ini
                            all_questions = quiz.questions.all()

                            for question in all_questions:
                                # Cari submission untuk question ini
                                submission = group_submissions.filter(
                                    question=question).first()

                                if submission:
                                    is_correct = submission.is_correct
                                    if is_correct:
                                        correct_count += 1
                                    else:
                                        incorrect_count += 1

                                    # User answer
                                    user_answer = None
                                    if submission.selected_choice:
                                        choice_map = {
                                            'A': question.choice_a,
                                            'B': question.choice_b,
                                            'C': question.choice_c,
                                            'D': question.choice_d
                                        }
                                        user_answer = f"{submission.selected_choice}. {choice_map.get(submission.selected_choice, '')}"

                                    # Correct answer
                                    correct_answer = None
                                    if hasattr(question, 'correct_choice') and question.correct_choice:
                                        choice_map = {
                                            'A': question.choice_a,
                                            'B': question.choice_b,
                                            'C': question.choice_c,
                                            'D': question.choice_d
                                        }
                                        correct_answer = f"{question.correct_choice}. {choice_map.get(question.correct_choice, '')}"

                                    questions_data.append({
                                        'id': submission.id,
                                        'question_id': question.id,
                                        'question_text': question.text,
                                        'question_image': getattr(question, 'image_url', None),
                                        'question_type': 'multiple_choice',
                                        'choices': {
                                            'A': question.choice_a,
                                            'B': question.choice_b,
                                            'C': question.choice_c,
                                            'D': question.choice_d
                                        },
                                        'user_answer': user_answer,
                                        'selected_choice': submission.selected_choice,
                                        'correct_answer': correct_answer,
                                        'is_correct': is_correct,
                                        'points': 1 if is_correct else 0,
                                        'max_points': 1,
                                        'explanation': getattr(question, 'explanation', None),
                                        'answered_by_name': f"{submission.student.first_name} {submission.student.last_name}".strip() or submission.student.username,
                                        'teacher_feedback': None
                                    })
                                else:
                                    # Question tidak dijawab
                                    unanswered_count += 1
                                    correct_answer = None
                                    if hasattr(question, 'correct_choice') and question.correct_choice:
                                        choice_map = {
                                            'A': question.choice_a,
                                            'B': question.choice_b,
                                            'C': question.choice_c,
                                            'D': question.choice_d
                                        }
                                        correct_answer = f"{question.correct_choice}. {choice_map.get(question.correct_choice, '')}"

                                    questions_data.append({
                                        'id': f"unanswered_{question.id}",
                                        'question_id': question.id,
                                        'question_text': question.text,
                                        'question_image': getattr(question, 'image_url', None),
                                        'question_type': 'multiple_choice',
                                        'choices': {
                                            'A': question.choice_a,
                                            'B': question.choice_b,
                                            'C': question.choice_c,
                                            'D': question.choice_d
                                        },
                                        'user_answer': None,
                                        'selected_choice': None,
                                        'correct_answer': correct_answer,
                                        'is_correct': False,
                                        'points': 0,
                                        'max_points': 1,
                                        'explanation': getattr(question, 'explanation', None),
                                        'answered_by_name': 'Tidak dijawab',
                                        'teacher_feedback': None
                                    })

                            logger.info(
                                f"Found {len(questions_data)} questions for group quiz")
                        else:
                            logger.warning(
                                "GroupQuiz not found for user's group")
                    else:
                        logger.warning(
                            "User not in any group for this quiz material")

                except Exception as e:
                    logger.error(f"Error getting group quiz questions: {e}")

            elif quiz and not is_group_quiz:
                # PERBAIKAN: Untuk individual quiz, cari dari StudentQuizAttempt jika ada
                try:
                    # Coba cari StudentQuizAttempt berdasarkan quiz dan user
                    from pramlearnapp.models import StudentQuizAttempt, StudentQuizAnswer

                    quiz_attempt = StudentQuizAttempt.objects.filter(
                        quiz=quiz,
                        student=request.user
                    ).order_by('-completed_at').first()

                    if quiz_attempt:
                        # Get quiz answers
                        quiz_answers = StudentQuizAnswer.objects.filter(
                            quiz_attempt=quiz_attempt
                        ).select_related('question').order_by('question__id')

                        # Process answers
                        for answer in quiz_answers:
                            question = answer.question
                            is_correct = getattr(answer, 'is_correct', False)

                            if is_correct:
                                correct_count += 1
                            elif getattr(answer, 'selected_choice', None) or getattr(answer, 'answer_text', None):
                                incorrect_count += 1
                            else:
                                unanswered_count += 1

                            # Determine correct answer untuk multiple choice
                            correct_answer = None
                            if question.question_type == 'multiple_choice':
                                correct_choice = getattr(
                                    question, 'correct_choice', None)
                                if correct_choice:
                                    choice_map = {
                                        'A': question.choice_a,
                                        'B': question.choice_b,
                                        'C': question.choice_c,
                                        'D': question.choice_d
                                    }
                                    correct_answer = f"{correct_choice}. {choice_map.get(correct_choice, '')}"

                            # User answer
                            user_answer = None
                            if getattr(answer, 'selected_choice', None):
                                choice_map = {
                                    'A': question.choice_a,
                                    'B': question.choice_b,
                                    'C': question.choice_c,
                                    'D': question.choice_d
                                }
                                user_answer = f"{answer.selected_choice}. {choice_map.get(answer.selected_choice, '')}"
                            elif getattr(answer, 'answer_text', None):
                                user_answer = answer.answer_text

                            questions_data.append({
                                'id': answer.id,
                                'question_id': question.id,
                                'question_text': question.text,
                                'question_image': getattr(question, 'image_url', None),
                                'question_type': question.question_type,
                                'choices': {
                                    'A': question.choice_a,
                                    'B': question.choice_b,
                                    'C': question.choice_c,
                                    'D': question.choice_d
                                } if question.question_type == 'multiple_choice' else None,
                                'user_answer': user_answer,
                                'selected_choice': getattr(answer, 'selected_choice', None),
                                'correct_answer': correct_answer,
                                'is_correct': is_correct,
                                'points': getattr(answer, 'points_earned', None),
                                'max_points': getattr(question, 'points', 1),
                                'explanation': getattr(question, 'explanation', None),
                                'answered_by_name': request.user.get_full_name() or request.user.username,
                                'teacher_feedback': getattr(answer, 'teacher_feedback', None)
                            })

                        logger.info(
                            f"Found {len(questions_data)} questions for individual quiz")
                    else:
                        logger.warning(
                            "No StudentQuizAttempt found for this quiz and user")

                except Exception as e:
                    logger.error(
                        f"Error getting individual quiz questions: {e}")

            # Build final response
            # Hitung duration dari quiz jika ada start_time dan end_time
            duration = None
            if quiz:
                if hasattr(quiz, 'duration'):
                    duration = quiz.duration
                elif hasattr(quiz, 'start_time') and hasattr(quiz, 'end_time') and quiz.start_time and quiz.end_time:
                    duration = int(
                        (quiz.end_time - quiz.start_time).total_seconds() // 60)

            response_data = {
                'quiz': {
                    'id': quiz.id if quiz else grade.id,
                    'title': quiz.title if quiz else grade.title,
                    'subject_name': getattr(grade, 'subject_name', None) or (quiz.material.subject.name if quiz and quiz.material and quiz.material.subject else 'Unknown Subject'),
                    'material_title': getattr(grade, 'material_title', None) or (quiz.material.title if quiz and quiz.material else 'Unknown Material'),
                    'duration': duration,
                    'total_questions': len(questions_data),
                    'description': quiz.content if quiz else 'Quiz details not available'
                },
                'attempt': {
                    'id': grade.id,
                    'score': grade.grade,
                    'completed_at': grade.date,
                    'duration': None,
                    'started_at': None,
                    'teacher_feedback': getattr(grade, 'teacher_feedback', None)
                },
                'questions': questions_data,
                'summary': {
                    'total_questions': len(questions_data),
                    'correct_answers': correct_count,
                    'incorrect_answers': incorrect_count,
                    'unanswered': unanswered_count,
                    'accuracy_percentage': (correct_count / len(questions_data) * 100) if questions_data else 0
                },
                'is_group_quiz': is_group_quiz,
                'group_data': group_data
            }

            logger.info(
                f"Quiz review for ID {attempt_id}: {correct_count}/{len(questions_data)} correct, is_group_quiz: {is_group_quiz}")
            return Response(response_data)

        except Exception as e:
            logger.error(f"Error in QuizReviewView: {e}")
            import traceback
            traceback.print_exc()

            return Response(
                {
                    'error': str(e),
                    'detail': f'No quiz data found with ID {attempt_id} for user {request.user.id}',
                    'suggestions': [
                        'Check if the quiz ID is correct',
                        'Verify that the user has access to this quiz',
                        'Contact administrator if the issue persists'
                    ]
                },
                status=status.HTTP_404_NOT_FOUND
            )

    def download_quiz_report(self, request, attempt_id, format_type='pdf'):
        """Download quiz report"""
        try:
            # Get grade data
            grade = get_object_or_404(
                Grade,
                id=attempt_id,
                student=request.user,
                type='quiz'
            )

            if format_type == 'pdf':
                return self.generate_quiz_pdf_report(grade, request.user)
            else:
                return self.generate_quiz_text_report(grade, request.user)

        except Exception as e:
            logger.error(f"Error generating quiz report: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def generate_quiz_pdf_report(self, grade, user):
        """Generate PDF report using reportlab mirip modal QuizResultsDetail"""
        try:
            from reportlab.lib.enums import TA_CENTER, TA_LEFT
            buffer = BytesIO()
            doc = SimpleDocTemplate(
                buffer,
                pagesize=A4,
                rightMargin=36,
                leftMargin=36,
                topMargin=36,
                bottomMargin=24
            )
            styles = getSampleStyleSheet()
            story = []

            # --- HEADER: Hasil Quiz ---
            from reportlab.lib.colors import HexColor
            from reportlab.platypus import Table, TableStyle

            # Deteksi apakah group quiz
            is_group_quiz = grade.title and "group" in grade.title.lower()
            quiz_type = "Quiz Kelompok" if is_group_quiz else "Quiz"

            header_style = ParagraphStyle(
                "Header",
                parent=styles["Heading1"],
                fontSize=18,
                alignment=TA_CENTER,
                textColor=HexColor(
                    "#3a3f5c" if not is_group_quiz else "#722ed1"),
                spaceAfter=12,
            )
            story.append(
                Paragraph(f"{quiz_type} Feedback Report", header_style))
            story.append(Spacer(1, 8))

            # Quiz title & subject
            story.append(Paragraph(
                f'<b>{grade.title or "Quiz"}</b> - <font color="#888">{getattr(grade, "subject_name", "") or "Mata Pelajaran"}</font>',
                styles["Normal"]
            ))
            story.append(Spacer(1, 8))

            # Status badge
            nilai = float(grade.grade or 0)
            if nilai >= 85:
                badge = "🌟 Sangat Baik"
                badge_color = "#52c41a"
                bg_color = "#f6ffed"
            elif nilai >= 70:
                badge = "👍 Baik"
                badge_color = "#faad14"
                bg_color = "#fffbe6"
            else:
                badge = "📚 Perlu Perbaikan"
                badge_color = "#ff4d4f"
                bg_color = "#fff1f0"

            badge_table = Table(
                [[Paragraph(
                    f'<font color="{badge_color}"><b>{badge}</b></font>', styles["Normal"])]],
                style=[
                    ("BACKGROUND", (0, 0), (-1, -1), HexColor(bg_color)),
                    ("BOX", (0, 0), (-1, -1), 1, HexColor(badge_color)),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ]
            )
            story.append(badge_table)
            story.append(Spacer(1, 12))

            # --- FEEDBACK QUIZ ---
            feedback_text = getattr(
                grade, "teacher_feedback", None) or "Quiz telah diselesaikan dengan baik."
            feedback_icon = "⭐" if is_group_quiz else "📝"
            feedback_para = Paragraph(
                f'{feedback_icon} <b>Feedback {quiz_type}:</b><br/><font color="#888"><i>{feedback_text}</i></font>',
                styles["Normal"]
            )
            feedback_table = Table(
                [[feedback_para]],
                style=[
                    ("BACKGROUND", (0, 0), (-1, -1), HexColor("#e6f7ff")),
                    ("BOX", (0, 0), (-1, -1), 1, HexColor("#91d5ff")),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ]
            )
            story.append(feedback_table)
            story.append(Spacer(1, 16))

            # --- DETAIL HASIL QUIZ (2 kolom) ---
            info_style = ParagraphStyle(
                "info", parent=styles["Normal"], fontSize=11, spaceAfter=4)

            # Kiri: Informasi Skor
            info_skor = [
                [Paragraph('<b>📊 Informasi Skor</b>', styles["BodyText"])],
                [Paragraph(
                    f'Skor Akhir: <font color="{badge_color}"><b>{nilai:.1f}/100</b></font>', info_style)],
                [Paragraph(
                    f'Grade: <b>{("A" if nilai >= 90 else "B" if nilai >= 80 else "C" if nilai >= 70 else "D" if nilai >= 60 else "E")}</b>', info_style)],
                [Paragraph(
                    'Status: <font color="#52c41a"><b>Selesai</b></font>', info_style)],
            ]

            # Kanan: Timeline
            tgl_selesai = grade.date.strftime(
                "%d %B %Y") if grade.date else "-"
            timeline = [
                [Paragraph('<b>📅 Timeline Quiz</b>', styles["BodyText"])],
                [Paragraph(f'Diselesaikan: <b>{tgl_selesai}</b>', info_style)],
                [Paragraph('Durasi: <b>N/A menit</b>', info_style)],
            ]

            if is_group_quiz:
                timeline.append(
                    [Paragraph('Kelompok: <b>Tim</b>', info_style)])

            detail_table = Table(
                [[Table(info_skor), Table(timeline)]],
                colWidths=[240, 240],
                style=[
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ]
            )
            story.append(detail_table)
            story.append(Spacer(1, 16))

            # --- STATISTIK RINGKASAN ---
            stats_data = [
                ['Statistik', 'Benar', 'Salah', 'Tidak Dijawab', 'Total Soal'],
                ['Jumlah', '0', '0', '0', '0']
            ]
            stats_table = Table(
                stats_data,
                style=[
                    ("BACKGROUND", (0, 0), (-1, 0), HexColor("#f0f0f0")),
                    ("GRID", (0, 0), (-1, -1), 1, HexColor("#d9d9d9")),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ]
            )
            story.append(
                Paragraph('<b>📊 Ringkasan Statistik</b>', styles["BodyText"]))
            story.append(stats_table)
            story.append(Spacer(1, 16))

            # --- REVIEW SOAL ---
            story.append(
                Paragraph('<b>📝 Review Jawaban</b>', styles["BodyText"]))
            story.append(Paragraph(
                '<font color="#888">Detail soal dan jawaban tidak tersedia untuk quiz ini.</font>', info_style))
            story.append(Paragraph(
                '<font size=9 color="#888">💡 Tips: Hubungi guru untuk mendapatkan review detail jawaban dan penjelasan materi.</font>', info_style))
            story.append(Spacer(1, 16))

            # --- Saran Pengembangan ---
            if nilai >= 90:
                saran = [
                    f"Selamat! {'Tim telah' if is_group_quiz else 'Anda telah'} menunjukkan {'kerja sama dan ' if is_group_quiz else ''}pemahaman yang sangat baik pada quiz ini.",
                    "Saran untuk langkah selanjutnya:",
                    "- Pertahankan konsistensi belajar yang sudah baik" +
                    (" dan kerja sama tim" if is_group_quiz else ""),
                    "- Bantu " +
                    ("kelompok lain" if is_group_quiz else "teman-teman") +
                    " yang membutuhkan bantuan",
                    "- Eksplorasi materi tambahan untuk memperdalam pemahaman" +
                    (" secara bersama-sama" if is_group_quiz else "")
                ]
                saran_color = "#f6ffed"
            elif nilai >= 75:
                saran = [
                    f"{'Tim telah' if is_group_quiz else 'Anda telah'} menunjukkan {'kerja sama dan ' if is_group_quiz else ''}pemahaman yang cukup baik pada quiz ini.",
                    "Saran untuk perbaikan:",
                    "- Review kembali materi yang terkait dengan quiz" +
                    (" bersama anggota tim" if is_group_quiz else ""),
                    "- Konsultasi dengan guru untuk klarifikasi konsep yang belum jelas",
                    "- Latihan soal tambahan untuk memperkuat pemahaman" +
                    (" dan strategi tim" if is_group_quiz else "")
                ]
                saran_color = "#e6f7ff"
            else:
                saran = [
                    f"Ada beberapa area yang perlu diperbaiki {'dalam kerja sama dan pemahaman tim ' if is_group_quiz else ''}untuk quiz ini.",
                    "Langkah yang disarankan:",
                    "- Pelajari kembali materi dasar yang terkait" +
                    (" secara bersama-sama" if is_group_quiz else ""),
                    "- Minta bantuan guru untuk " +
                    ("mentoring kelompok" if is_group_quiz else "penjelasan lebih detail"),
                    "- Buat " +
                    ("jadwal study group" if is_group_quiz else "catatan ringkasan") +
                    " yang teratur",
                    "- Jangan ragu untuk bertanya jika ada yang tidak dipahami"
                ]
                saran_color = "#fffbe6"

            saran_table = Table(
                [[Paragraph("<br/>".join(saran), info_style)]],
                style=[
                    ("BACKGROUND", (0, 0), (-1, -1), HexColor(saran_color)),
                    ("BOX", (0, 0), (-1, -1), 1, HexColor("#d9d9d9")),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ]
            )
            story.append(Spacer(1, 8))
            story.append(Paragraph(
                f'<b>💡 Saran Pengembangan {"Tim" if is_group_quiz else ""}</b>', styles["BodyText"]))
            story.append(saran_table)
            story.append(Spacer(1, 16))

            # --- Contact Section ---
            contact_para = Paragraph(
                f'<b>💬 Butuh Penjelasan Lebih Lanjut?</b><br/>'
                f'Hubungi guru mata pelajaran untuk diskusi {"strategi kelompok dan " if is_group_quiz else ""}review materi lebih detail.',
                info_style
            )
            contact_table = Table(
                [[contact_para]],
                style=[
                    ("BACKGROUND", (0, 0), (-1, -1), HexColor("#f0f8ff")),
                    ("BOX", (0, 0), (-1, -1), 2, HexColor("#d9d9d9"), 'DASHED'),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ]
            )
            story.append(contact_table)
            story.append(Spacer(1, 16))

            # --- Footer ---
            footer_style = ParagraphStyle(
                'Footer',
                parent=styles['Normal'],
                fontSize=9,
                textColor=colors.gray,
                alignment=TA_CENTER
            )
            story.append(Spacer(1, 20))
            story.append(
                Paragraph("Generated by PramLearn System", footer_style))
            story.append(Paragraph(
                f"Generated on {datetime.datetime.now().strftime('%d %B %Y at %H:%M')}", footer_style))

            doc.build(story)
            pdf_data = buffer.getvalue()
            buffer.close()

            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="quiz-report-{grade.id}.pdf"'
            response.write(pdf_data)
            return response

        except Exception as e:
            logger.error(f"Error generating quiz PDF: {e}")
            return HttpResponse("Error generating PDF report", status=500)


class GroupQuizReviewView(APIView):
    """API untuk mendapatkan detail review quiz attempt"""
    permission_classes = [IsAuthenticated]

    def get(self, request, attempt_id):
        """Get quiz review details"""
        download_format = request.GET.get('format')

        if download_format:
            return self.download_quiz_report(request, attempt_id, download_format)

        try:
            # Import model yang diperlukan
            from pramlearnapp.models.group import GroupQuiz, GroupQuizSubmission, GroupMember, GroupQuizResult
            from pramlearnapp.models.quiz import Quiz, Question
            from pramlearnapp.models import Grade

            # PERBAIKAN: Coba cari data dengan berbagai cara
            attempt = None
            grade = None
            quiz = None
            is_group_quiz = True  # Karena ini khusus untuk group quiz
            group_data = None

            # Method 1: Cari berdasarkan Grade dengan tipe quiz dan group keyword
            try:
                grade = get_object_or_404(
                    Grade,
                    id=attempt_id,
                    student=request.user,
                    type='quiz'
                )
                logger.info(f"Found Grade {attempt_id} with type quiz")

                # PERBAIKAN: Deteksi group quiz berdasarkan title atau langsung cari
                if grade.title and "group" in grade.title.lower():
                    # Cari quiz berdasarkan title matching
                    quiz_title_clean = grade.title.replace(
                        'Quiz ', '').replace('(Group)', '').strip()
                    possible_quiz = Quiz.objects.filter(
                        title__icontains=quiz_title_clean,
                        is_group_quiz=True
                    ).first()

                    if possible_quiz:
                        quiz = possible_quiz
                        logger.info(f"Found matching group quiz: {quiz.title}")

                        # Cari GroupMember untuk user ini
                        user_group_member = GroupMember.objects.filter(
                            student=request.user,
                            group__material=quiz.material
                        ).first()

                        if user_group_member:
                            # Build group_data
                            group_members = GroupMember.objects.filter(
                                group=user_group_member.group
                            ).select_related('student')

                            group_data = {
                                'id': user_group_member.group.id,
                                'name': user_group_member.group.name,
                                'code': user_group_member.group.code,
                                'members': [
                                    {
                                        'id': m.student.id,
                                        'name': f"{m.student.first_name} {m.student.last_name}".strip() or m.student.username,
                                        'username': m.student.username,
                                        'student_id': m.student.username,
                                        'is_current_user': m.student.id == request.user.id
                                    }
                                    for m in group_members
                                ]
                            }
                            logger.info(
                                f"Found group data: {group_data['name']} with {len(group_data['members'])} members")
                        else:
                            logger.warning(
                                "User not found in any group for this quiz material")
                else:
                    # Fallback: coba cari berdasarkan title tanpa "group" keyword
                    quiz_title_clean = grade.title.replace('Quiz ', '').strip()
                    possible_quiz = Quiz.objects.filter(
                        title__icontains=quiz_title_clean,
                        is_group_quiz=True
                    ).first()

                    if possible_quiz:
                        quiz = possible_quiz
                        logger.info(f"Found matching group quiz: {quiz.title}")

            except Exception as e:
                logger.error(f"Error finding grade: {e}")
                return Response(
                    {'error': f'No quiz data found with ID {attempt_id}'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Build questions data untuk group quiz
            questions_data = []
            correct_count = 0
            incorrect_count = 0
            unanswered_count = 0

            if quiz:
                try:
                    # Cari user's group member
                    user_group_member = GroupMember.objects.filter(
                        student=request.user,
                        group__material=quiz.material
                    ).first()

                    if user_group_member:
                        # Cari GroupQuiz
                        group_quiz = GroupQuiz.objects.filter(
                            quiz=quiz,
                            group=user_group_member.group
                        ).first()

                        if group_quiz:
                            # Get submissions untuk group quiz ini
                            group_submissions = GroupQuizSubmission.objects.filter(
                                group_quiz=group_quiz
                            ).select_related('question', 'student')

                            # Get all questions untuk quiz ini
                            all_questions = quiz.questions.all()

                            for question in all_questions:
                                # Cari submission untuk question ini
                                submission = group_submissions.filter(
                                    question=question).first()

                                if submission:
                                    is_correct = submission.is_correct
                                    if is_correct:
                                        correct_count += 1
                                    else:
                                        incorrect_count += 1

                                    # User answer
                                    user_answer = None
                                    if submission.selected_choice:
                                        choice_map = {
                                            'A': question.choice_a,
                                            'B': question.choice_b,
                                            'C': question.choice_c,
                                            'D': question.choice_d
                                        }
                                        user_answer = f"{submission.selected_choice}. {choice_map.get(submission.selected_choice, '')}"

                                    # Correct answer
                                    correct_answer = None
                                    if hasattr(question, 'correct_choice') and question.correct_choice:
                                        choice_map = {
                                            'A': question.choice_a,
                                            'B': question.choice_b,
                                            'C': question.choice_c,
                                            'D': question.choice_d
                                        }
                                        correct_answer = f"{question.correct_choice}. {choice_map.get(question.correct_choice, '')}"

                                    questions_data.append({
                                        'id': submission.id,
                                        'question_id': question.id,
                                        'question_text': question.text,
                                        'question_image': getattr(question, 'image_url', None),
                                        'question_type': 'multiple_choice',
                                        'choices': {
                                            'A': question.choice_a,
                                            'B': question.choice_b,
                                            'C': question.choice_c,
                                            'D': question.choice_d
                                        },
                                        'user_answer': user_answer,
                                        'selected_choice': submission.selected_choice,
                                        'correct_answer': correct_answer,
                                        'is_correct': is_correct,
                                        'points': 1 if is_correct else 0,
                                        'max_points': 1,
                                        'explanation': getattr(question, 'explanation', None),
                                        'answered_by_name': f"{submission.student.first_name} {submission.student.last_name}".strip() or submission.student.username,
                                        'teacher_feedback': None
                                    })
                                else:
                                    # Question tidak dijawab
                                    unanswered_count += 1
                                    correct_answer = None
                                    if hasattr(question, 'correct_choice') and question.correct_choice:
                                        choice_map = {
                                            'A': question.choice_a,
                                            'B': question.choice_b,
                                            'C': question.choice_c,
                                            'D': question.choice_d
                                        }
                                        correct_answer = f"{question.correct_choice}. {choice_map.get(question.correct_choice, '')}"

                                    questions_data.append({
                                        'id': f"unanswered_{question.id}",
                                        'question_id': question.id,
                                        'question_text': question.text,
                                        'question_image': getattr(question, 'image_url', None),
                                        'question_type': 'multiple_choice',
                                        'choices': {
                                            'A': question.choice_a,
                                            'B': question.choice_b,
                                            'C': question.choice_c,
                                            'D': question.choice_d
                                        },
                                        'user_answer': None,
                                        'selected_choice': None,
                                        'correct_answer': correct_answer,
                                        'is_correct': False,
                                        'points': 0,
                                        'max_points': 1,
                                        'explanation': getattr(question, 'explanation', None),
                                        'answered_by_name': 'Tidak dijawab',
                                        'teacher_feedback': None
                                    })

                            # Get GroupQuizResult untuk informasi tambahan
                            try:
                                group_quiz_result = GroupQuizResult.objects.get(
                                    group_quiz=group_quiz
                                )
                                completed_at = group_quiz_result.completed_at
                                final_score = group_quiz_result.score
                            except GroupQuizResult.DoesNotExist:
                                completed_at = group_quiz.submitted_at
                                final_score = grade.grade

                            logger.info(
                                f"Found {len(questions_data)} questions for group quiz")
                        else:
                            logger.warning(
                                "GroupQuiz not found for user's group")
                    else:
                        logger.warning(
                            "User not in any group for this quiz material")

                except Exception as e:
                    logger.error(f"Error getting group quiz questions: {e}")

            # Build final response
            # Hitung duration dari quiz jika ada start_time dan end_time
            duration = None
            if quiz:
                if hasattr(quiz, 'duration'):
                    duration = quiz.duration
                elif group_quiz and group_quiz.start_time and group_quiz.end_time:
                    duration = int(
                        (group_quiz.end_time - group_quiz.start_time).total_seconds() // 60)

            # PERBAIKAN: Gunakan field yang sesuai dengan model GroupQuiz
            response_data = {
                'quiz': {
                    'id': quiz.id if quiz else grade.id,
                    'title': quiz.title if quiz else grade.title,
                    'subject_name': getattr(grade, 'subject_name', None) or (quiz.material.subject.name if quiz and quiz.material and quiz.material.subject else 'Unknown Subject'),
                    'material_title': getattr(grade, 'material_title', None) or (quiz.material.title if quiz and quiz.material else 'Unknown Material'),
                    'duration': duration,
                    'total_questions': len(questions_data),
                    'description': quiz.content if quiz else 'Quiz details not available'
                },
                'attempt': {
                    'id': grade.id,
                    'score': final_score if 'final_score' in locals() else grade.grade,
                    'completed_at': completed_at if 'completed_at' in locals() else grade.date,
                    'duration': duration,
                    'started_at': group_quiz.start_time if 'group_quiz' in locals() and group_quiz else None,
                    'submitted_at': group_quiz.submitted_at if 'group_quiz' in locals() and group_quiz else grade.date,
                    'teacher_feedback': getattr(grade, 'teacher_feedback', None)
                },
                'questions': questions_data,
                'summary': {
                    'total_questions': len(questions_data),
                    'correct_answers': correct_count,
                    'incorrect_answers': incorrect_count,
                    'unanswered': unanswered_count,
                    'accuracy_percentage': (correct_count / len(questions_data) * 100) if questions_data else 0
                },
                'is_group_quiz': is_group_quiz,
                'group_data': group_data,
                # TAMBAHAN: Informasi spesifik group quiz
                'group_quiz_info': {
                    'group_name': group_data['name'] if group_data else None,
                    'group_code': group_data['code'] if group_data else None,
                    'total_members': len(group_data['members']) if group_data else 0,
                    'quiz_started_at': group_quiz.start_time if 'group_quiz' in locals() and group_quiz else None,
                    'quiz_submitted_at': group_quiz.submitted_at if 'group_quiz' in locals() and group_quiz else None,
                    'is_completed': group_quiz.is_completed if 'group_quiz' in locals() and group_quiz else True,
                } if group_data else None
            }

            logger.info(
                f"Group Quiz review for ID {attempt_id}: {correct_count}/{len(questions_data)} correct, group: {group_data['name'] if group_data else 'Unknown'}")
            return Response(response_data)

        except Exception as e:
            logger.error(f"Error in GroupQuizReviewView: {e}")
            import traceback
            traceback.print_exc()

            return Response(
                {
                    'error': str(e),
                    'detail': f'No group quiz data found with ID {attempt_id} for user {request.user.id}',
                    'suggestions': [
                        'Check if the quiz ID is correct',
                        'Verify that the user has access to this group quiz',
                        'Ensure the user is a member of the group for this quiz',
                        'Contact administrator if the issue persists'
                    ]
                },
                status=status.HTTP_404_NOT_FOUND
            )


    def download_group_quiz_report(self, request, attempt_id, format_type='pdf'):
        """Download group quiz report"""
        try:
            # Get grade data for group quiz
            grade = get_object_or_404(
                Grade,
                id=attempt_id,
                student=request.user,
                type='quiz'
            )

            # Verify it's a group quiz
            if not (grade.title and "group" in grade.title.lower()):
                return Response(
                    {'error': 'This is not a group quiz'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if format_type == 'pdf':
                return self.generate_group_quiz_pdf_report(grade, request.user)
            else:
                return self.generate_group_quiz_text_report(grade, request.user)

        except Exception as e:
            logger.error(f"Error generating group quiz report: {e}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def generate_group_quiz_pdf_report(self, grade, user):
        """Generate Group Quiz PDF report - menggunakan method yang sama dengan individual quiz tapi dengan penyesuaian"""
        # Menggunakan method yang sama dari QuizReviewView dengan flag group quiz
        quiz_review_view = QuizReviewView()
        return quiz_review_view.generate_quiz_pdf_report(grade, user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_analytics(request):
    user = request.user

    # Ambil semua grades untuk student
    grades = Grade.objects.filter(
        student=user).select_related('subject', 'assignment')

    if not grades.exists():
        return Response({
            'overview': {
                'total_assessments': 0,
                'average_score': 0,
                'highest_score': 0,
                'lowest_score': 0
            },
            'monthly_trends': [],
            'subject_performance': []
        })

    # Calculate overview statistics
    overview = {
        'total_assessments': grades.count(),
        'average_score': grades.aggregate(avg=Avg('grade'))['avg'] or 0,
        'highest_score': grades.aggregate(max=Max('grade'))['max'] or 0,
        'lowest_score': grades.aggregate(min=Min('grade'))['min'] or 0
    }

    # Subject performance
    subject_performance = grades.values('subject__name').annotate(
        avg_score=Avg('grade'),
        total_assessments=Count('id')
    ).order_by('-avg_score')

    return Response({
        'overview': overview,
        'monthly_trends': [],  # Implementasi sesuai kebutuhan
        'subject_performance': list(subject_performance)
    })
