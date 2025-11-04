from rest_framework import generics
from pramlearnapp.models import CustomUser, ClassStudent
from pramlearnapp.serializers import AvailableStudentSerializer


class AvailableStudentListView(generics.ListAPIView):
    serializer_class = AvailableStudentSerializer

    def get_queryset(self):
        class_id = self.request.query_params.get('class_id', None)
        if class_id is not None:
            # Ambil semua student yang terdaftar di kelas selain class_id yang dimaksud
            enrolled_students = ClassStudent.objects.exclude(
                class_id=class_id
            ).values_list('student_id', flat=True)
            # Filter student dengan role ID = 3 yang hanya terdaftar di class_id atau tidak terdaftar di kelas mana pun
            return CustomUser.objects.filter(
                role__id=3
            ).exclude(id__in=enrolled_students)
        else:
            # Jika class_id tidak diberikan, kembalikan semua student dengan role ID = 3 yang tidak terdaftar di kelas mana pun
            enrolled_students = ClassStudent.objects.values_list(
                'student_id', flat=True)
            return CustomUser.objects.filter(role__id=3).exclude(id__in=enrolled_students)


class AvailableAndRelatedStudentListView(generics.ListAPIView):
    serializer_class = AvailableStudentSerializer

    def get_queryset(self):
        class_id = self.kwargs['class_id']
        related_students = ClassStudent.objects.filter(
            class_id=class_id).values_list('student_id', flat=True)
        enrolled_students = ClassStudent.objects.exclude(
            class_id=class_id).values_list('student_id', flat=True)
        return CustomUser.objects.filter(role__name='Student').exclude(id__in=enrolled_students).union(
            CustomUser.objects.filter(id__in=related_students)
        )
