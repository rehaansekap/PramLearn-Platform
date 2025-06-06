from rest_framework import viewsets, permissions
from pramlearnapp.models.schedule import Schedule
from pramlearnapp.serializers import TodayScheduleSerializer, ScheduleModelSerializer


class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleModelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter by class, subject, day, etc jika ada query param
        queryset = super().get_queryset()
        class_id = self.request.query_params.get('class_id')
        if class_id:
            queryset = queryset.filter(class_obj_id=class_id)
        return queryset
