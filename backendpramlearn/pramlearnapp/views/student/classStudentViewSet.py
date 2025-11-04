from rest_framework import viewsets, permissions
from rest_framework import generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from pramlearnapp.models import ClassStudent, CustomUser, StudentMotivationProfile
from pramlearnapp.serializers import ClassStudentSerializer
from pramlearnapp.serializers.student.studentSerializer import StudentSerializer


class ClassStudentViewSet(viewsets.ModelViewSet):
    queryset = ClassStudent.objects.all()
    serializer_class = ClassStudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path=r'(?P<class_id>\d+)')
    def by_class(self, request, class_id=None):
        students = self.queryset.filter(class_id=class_id)
        serializer = self.get_serializer(students, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path=r'(?P<class_id>\d+)/with-profile')
    def by_class_with_profile(self, request, class_id=None):
        """Get all students in a class with their motivation profiles"""
        try:
            class_students = ClassStudent.objects.filter(
                class_id=class_id
            ).select_related('student__studentmotivationprofile')

            if not class_students.exists():
                return Response([], status=200)

            students_list = [cs.student for cs in class_students]

            # Gunakan StudentSerializer yang sudah ada profil motivasi
            serializer = StudentSerializer(students_list, many=True)
            return Response(serializer.data)

        except Exception as e:
            print(f"Error in by_class_with_profile: {str(e)}")  # Debug log
            return Response({'error': str(e)}, status=400)

    @action(detail=False, methods=['delete'], url_path='user/(?P<user_id>[^/.]+)')
    def delete_by_user(self, request, user_id=None):
        """
        Hapus semua relasi ClassStudent untuk user/student tertentu.
        """
        deleted, _ = ClassStudent.objects.filter(student_id=user_id).delete()
        return Response({'deleted': deleted}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['delete'], url_path=r'class/(?P<class_id>\d+)/student/(?P<student_id>\d+)')
    def delete_by_class_and_student(self, request, class_id=None, student_id=None):
        rel = ClassStudent.objects.filter(
            class_id=class_id, student_id=student_id).first()
        if rel:
            rel.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)


class ClassStudentDetail(generics.RetrieveDestroyAPIView):
    queryset = ClassStudent.objects.all()
    serializer_class = ClassStudentSerializer

    def get_object(self):
        queryset = self.get_queryset()
        filter_kwargs = {
            'class_id': self.kwargs['class_id'],
            'student_id': self.kwargs['student_id']
        }
        return generics.get_object_or_404(queryset, **filter_kwargs)
