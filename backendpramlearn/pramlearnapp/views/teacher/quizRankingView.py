from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Count, Avg, Q, F
from pramlearnapp.models import Quiz, Group, GroupQuiz, GroupQuizSubmission, GroupQuizResult, GroupMember, CustomUser
from pramlearnapp.serializers.teacher.groupSerializer import GroupSerializer


class QuizRankingView(APIView):
    """
    API View untuk mendapatkan ranking real-time kelompok pada quiz tertentu
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, quiz_id):
        material_id = request.query_params.get('material_id')

        try:
            quiz = Quiz.objects.get(id=quiz_id)

            # Filter groups berdasarkan material jika ada
            if material_id:
                groups = Group.objects.filter(material_id=material_id)
            else:
                groups = Group.objects.filter(material=quiz.material)

            # Ambil GroupQuiz yang terkait dengan quiz ini
            group_quizzes = GroupQuiz.objects.filter(
                quiz=quiz,
                group__in=groups
            ).select_related('group')

            ranking_data = []

            for group_quiz in group_quizzes:
                group = group_quiz.group

                # Hitung jumlah anggota kelompok
                member_count = GroupMember.objects.filter(group=group).count()

                # Ambil atau hitung score dari GroupQuizResult
                try:
                    result = GroupQuizResult.objects.get(group_quiz=group_quiz)
                    score = result.score
                except GroupQuizResult.DoesNotExist:
                    # Jika belum ada result, hitung manual
                    score = group_quiz.calculate_and_save_score().score

                # Hitung jawaban benar dan total soal
                total_questions = quiz.questions.count()
                correct_submissions = GroupQuizSubmission.objects.filter(
                    group_quiz=group_quiz,
                    is_correct=True
                ).count()

                # Tentukan status kelompok
                total_submissions = GroupQuizSubmission.objects.filter(
                    group_quiz=group_quiz
                ).count()

                if total_submissions == 0:
                    status_group = 'not_started'
                elif total_submissions < total_questions:
                    status_group = 'in_progress'
                else:
                    status_group = 'completed'

                # Ambil nama-nama anggota kelompok
                members = GroupMember.objects.filter(
                    group=group).select_related('student')
                member_names = [f"{member.student.first_name} {member.student.last_name}".strip(
                ) or member.student.username for member in members]

                ranking_data.append({
                    'group_id': group.id,
                    'group_name': group.name,
                    'group_code': group.code,
                    'score': round(score, 2),
                    'correct_answers': correct_submissions,
                    'total_questions': total_questions,
                    'member_count': member_count,
                    'member_names': member_names,
                    'status': status_group,
                    'start_time': group_quiz.start_time.isoformat() if group_quiz.start_time else None,
                    'end_time': group_quiz.end_time.isoformat() if group_quiz.end_time else None,
                })

            # Sort berdasarkan score (descending), kemudian berdasarkan waktu submit
            ranking_data.sort(key=lambda x: (-x['score'], x['group_name']))

            return Response(ranking_data, status=status.HTTP_200_OK)

        except Quiz.DoesNotExist:
            return Response(
                {"error": "Quiz tidak ditemukan"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
