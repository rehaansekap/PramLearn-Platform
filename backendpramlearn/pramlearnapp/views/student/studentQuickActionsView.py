from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from datetime import datetime, timedelta
from django.utils import timezone
from pramlearnapp.models import (
    AssignmentSubmission, Assignment, Material, Quiz,
    GroupQuiz, GroupMember, Announcement, Schedule,
    ClassStudent, Subject, SubjectClass  # Ganti ClassEnrollment dengan ClassStudent
)


class StudentQuickActionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        try:
            # 1. Submit Assignment - assignments yang belum dikumpulkan
            pending_assignments = self.get_pending_assignments(user)

            # 2. Browse Materials - materials yang tersedia
            available_materials = self.get_available_materials(user)

            # 3. Announcements - announcements baru
            new_announcements = self.get_new_announcements(user)

            # 4. My Schedule - jadwal hari ini dan besok
            upcoming_schedule = self.get_upcoming_schedule(user)

            quick_actions = {
                'submit_assignment': {
                    'count': pending_assignments['count'],
                    'label': 'Submit Assignment',
                    'description': f"{pending_assignments['count']} pending",
                    'icon': 'download',
                    'color': '#ff4d4f',
                    'route': '/student/assignments',
                    'data': pending_assignments['assignments']
                },
                'browse_materials': {
                    'count': available_materials['count'],
                    'label': 'Browse Materials',
                    'description': f"{available_materials['count']} available",
                    'icon': 'file-text',
                    'color': '#1890ff',
                    'route': '/student/subjects',
                    'data': available_materials['materials']
                },
                'announcements': {
                    'count': new_announcements['count'],
                    'label': 'Announcements',
                    'description': f"{new_announcements['count']} new",
                    'icon': 'bell',
                    'color': '#faad14',
                    'route': '/student/announcements',
                    'data': new_announcements['announcements']
                },
                'schedule': {
                    'count': upcoming_schedule['count'],
                    'label': 'My Schedule',
                    'description': f"{upcoming_schedule['count']} upcoming",
                    'icon': 'calendar',
                    'color': '#52c41a',
                    'route': '/student/schedule',
                    'data': upcoming_schedule['schedules']
                }
            }

            return Response(quick_actions)

        except Exception as e:
            return Response({
                'error': str(e),
                'quick_actions': self.get_default_quick_actions()
            }, status=500)

    def get_pending_assignments(self, user):
        """Get assignments yang belum dikumpulkan oleh student"""
        try:
            # Get user's classes menggunakan ClassStudent
            user_classes = ClassStudent.objects.filter(
                student=user).values_list('class_id', flat=True)

            # Get subject_class IDs from user's classes
            subject_class_ids = SubjectClass.objects.filter(
                class_id__in=user_classes
            ).values_list('id', flat=True)

            # Get subject IDs
            subject_ids = Subject.objects.filter(
                subject_class_id__in=subject_class_ids
            ).values_list('id', flat=True)

            # Get material IDs
            material_ids = Material.objects.filter(
                subject_id__in=subject_ids
            ).values_list('id', flat=True)

            # Get assignments yang belum expired dan belum dikumpulkan
            assignments = Assignment.objects.filter(
                material_id__in=material_ids,
                due_date__gte=timezone.now()
            ).exclude(
                # Exclude assignments yang sudah dikumpulkan
                assignmentsubmission__student=user
            ).distinct()[:10]

            assignment_data = []
            for assignment in assignments:
                assignment_data.append({
                    'id': assignment.id,
                    'title': assignment.title,
                    'description': assignment.description,
                    'due_date': assignment.due_date.isoformat(),
                    'subject_name': assignment.material.subject.name if assignment.material.subject else 'Unknown',
                    'material_title': assignment.material.title,
                    'days_left': (assignment.due_date.date() - timezone.now().date()).days
                })

            return {
                'count': len(assignment_data),
                'assignments': assignment_data
            }
        except Exception as e:
            print(f"Error getting pending assignments: {e}")
            return {'count': 0, 'assignments': []}

    def get_available_materials(self, user):
        """Get materials yang tersedia untuk student"""
        try:
            user_classes = ClassStudent.objects.filter(
                student=user).values_list('class_id', flat=True)

            # Get subject_class IDs from user's classes
            subject_class_ids = SubjectClass.objects.filter(
                class_id__in=user_classes
            ).values_list('id', flat=True)

            # Get subject IDs
            subject_ids = Subject.objects.filter(
                subject_class_id__in=subject_class_ids
            ).values_list('id', flat=True)

            materials = Material.objects.filter(
                subject_id__in=subject_ids
            ).distinct()[:10]

            material_data = []
            for material in materials:
                material_data.append({
                    'id': material.id,
                    'title': material.title,
                    'description': material.description if hasattr(material, 'description') else '',
                    'subject_name': material.subject.name if material.subject else 'Unknown',
                    'slug': material.slug,
                    'created_at': material.created_at.isoformat() if hasattr(material, 'created_at') else ''
                })

            return {
                'count': len(material_data),
                'materials': material_data
            }
        except Exception as e:
            print(f"Error getting available materials: {e}")
            return {'count': 0, 'materials': []}

    def get_new_announcements(self, user):
        """Get announcements baru untuk student"""
        try:
            # Announcements dari 7 hari terakhir
            week_ago = timezone.now() - timedelta(days=7)
            user_classes = ClassStudent.objects.filter(
                student=user).values_list('class_id', flat=True)

            # Jika ada model Announcement, gunakan itu
            try:
                announcements = Announcement.objects.filter(
                    created_at__gte=week_ago
                )[:10]

                announcement_data = []
                for announcement in announcements:
                    announcement_data.append({
                        'id': announcement.id,
                        'title': announcement.title,
                        'content': announcement.content[:100] + '...' if len(announcement.content) > 100 else announcement.content,
                        'created_at': announcement.created_at.isoformat(),
                        'author': f"{announcement.author.first_name} {announcement.author.last_name}".strip() or announcement.author.username if hasattr(announcement, 'author') else 'System'
                    })

                return {
                    'count': len(announcement_data),
                    'announcements': announcement_data
                }
            except:
                # Fallback: use recent assignments as "announcements"
                subject_class_ids = SubjectClass.objects.filter(
                    class_id__in=user_classes
                ).values_list('id', flat=True)

                subject_ids = Subject.objects.filter(
                    subject_class_id__in=subject_class_ids
                ).values_list('id', flat=True)

                material_ids = Material.objects.filter(
                    subject_id__in=subject_ids
                ).values_list('id', flat=True)

                recent_assignments = Assignment.objects.filter(
                    material_id__in=material_ids,
                    created_at__gte=week_ago
                ).distinct()[:5]

                announcement_data = []
                for assignment in recent_assignments:
                    announcement_data.append({
                        'id': f"assignment_{assignment.id}",
                        'title': f"New Assignment: {assignment.title}",
                        'content': assignment.description[:100] + '...' if assignment.description and len(assignment.description) > 100 else assignment.description or '',
                        'created_at': assignment.created_at.isoformat() if hasattr(assignment, 'created_at') else '',
                        'author': 'System'
                    })

                return {
                    'count': len(announcement_data),
                    'announcements': announcement_data
                }

        except Exception as e:
            print(f"Error getting announcements: {e}")
            return {'count': 0, 'announcements': []}

    def get_upcoming_schedule(self, user):
        """Get jadwal upcoming untuk student"""
        try:
            tomorrow = timezone.now().date() + timedelta(days=1)
            user_classes = ClassStudent.objects.filter(
                student=user).values_list('class_id', flat=True)

            # Jika ada model Schedule, gunakan itu
            try:
                schedules = Schedule.objects.filter(
                    day_of_week=timezone.now().weekday(),
                    class_obj__in=user_classes
                ).distinct()[:10]

                schedule_data = []
                for schedule in schedules:
                    schedule_data.append({
                        'id': schedule.id,
                        'title': schedule.activity,
                        'description': f"Kelas {schedule.activity}",
                        'time': schedule.time.strftime('%H:%M') if schedule.time else None,
                        'subject_name': schedule.activity,
                        'class_name': 'Today Schedule'
                    })

                return {
                    'count': len(schedule_data),
                    'schedules': schedule_data
                }
            except:
                # Fallback: use upcoming assignment due dates as schedule
                subject_class_ids = SubjectClass.objects.filter(
                    class_id__in=user_classes
                ).values_list('id', flat=True)

                subject_ids = Subject.objects.filter(
                    subject_class_id__in=subject_class_ids
                ).values_list('id', flat=True)

                material_ids = Material.objects.filter(
                    subject_id__in=subject_ids
                ).values_list('id', flat=True)

                upcoming_assignments = Assignment.objects.filter(
                    material_id__in=material_ids,
                    due_date__date__gte=timezone.now().date(),
                    due_date__date__lte=tomorrow
                ).distinct()[:5]

                schedule_data = []
                for assignment in upcoming_assignments:
                    schedule_data.append({
                        'id': f"assignment_due_{assignment.id}",
                        'title': f"Assignment Due: {assignment.title}",
                        'description': f"Due date for {assignment.title}",
                        'time': assignment.due_date.time().strftime('%H:%M'),
                        'subject_name': assignment.material.subject.name if assignment.material.subject else 'Unknown',
                        'class_name': 'Assignment Deadline'
                    })

                return {
                    'count': len(schedule_data),
                    'schedules': schedule_data
                }

        except Exception as e:
            print(f"Error getting schedule: {e}")
            return {'count': 0, 'schedules': []}

    def get_default_quick_actions(self):
        """Default quick actions jika terjadi error"""
        return {
            'submit_assignment': {
                'count': 0,
                'label': 'Submit Assignment',
                'description': '0 pending',
                'icon': 'download',
                'color': '#ff4d4f',
                'route': '/student/assignments',
                'data': []
            },
            'browse_materials': {
                'count': 0,
                'label': 'Browse Materials',
                'description': '0 available',
                'icon': 'file-text',
                'color': '#1890ff',
                'route': '/student/subjects',
                'data': []
            },
            'announcements': {
                'count': 0,
                'label': 'Announcements',
                'description': '0 new',
                'icon': 'bell',
                'color': '#faad14',
                'route': '/student/announcements',
                'data': []
            },
            'schedule': {
                'count': 0,
                'label': 'My Schedule',
                'description': '0 upcoming',
                'icon': 'calendar',
                'color': '#52c41a',
                'route': '/student/schedule',
                'data': []
            }
        }
