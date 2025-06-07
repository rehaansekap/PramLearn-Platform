from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from pramlearnapp.models import StudentAttendance
from pramlearnapp.models.material import Material
from pramlearnapp.models.classes import ClassStudent
from pramlearnapp.serializers import StudentAttendanceSerializer


class MaterialAttendanceListView(generics.ListAPIView):
    """
    Get all attendance records for a specific material
    """
    serializer_class = StudentAttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        material_id = self.kwargs['material_id']
        return StudentAttendance.objects.filter(material_id=material_id).select_related(
            'student', 'material', 'updated_by'
        )


@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated])
def update_attendance(request, material_id, student_id):
    """
    Create or update attendance for a specific student and material
    """
    try:
        material = get_object_or_404(Material, id=material_id)

        # Get or create attendance record
        attendance, created = StudentAttendance.objects.get_or_create(
            student_id=student_id,
            material_id=material_id,
            defaults={'status': 'absent', 'updated_by': request.user}
        )

        # Update status and who updated it
        attendance.status = request.data.get('status', attendance.status)
        attendance.updated_by = request.user
        attendance.save()

        serializer = StudentAttendanceSerializer(attendance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_create_attendance(request, material_id):
    """
    Create attendance records for all students in the material's class
    """
    try:
        material = get_object_or_404(Material, id=material_id)
        subject = material.subject
        subject_class = subject.subject_class
        class_id = subject_class.class_id.id

        # Get all students in the class
        student_ids = ClassStudent.objects.filter(
            class_id=class_id
        ).values_list('student_id', flat=True)

        # Create attendance records for students who don't have one
        created_count = 0
        for student_id in student_ids:
            attendance, created = StudentAttendance.objects.get_or_create(
                student_id=student_id,
                material_id=material_id,
                defaults={'status': 'absent', 'updated_by': request.user}
            )
            if created:
                created_count += 1

        return Response({
            'message': f'Created {created_count} attendance records',
            'total_students': len(student_ids)
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
